/* eslint-disable @typescript-eslint/no-namespace */

/**
 * GeoIP helpers using local MaxMind *.mmdb files (GeoLite2 or GeoIP2).
 *
 * - No @maxmind/geoip2-node — uses the lighter "maxmind" reader.
 * - Supports City DB (country/region/city/lat/lon/tz) and optional ASN DB.
 * - Hot-reloads readers if the .mmdb files are updated on disk.
 *
 * DBs you likely have via geoipupdate:
 *   - /usr/share/GeoIP/GeoLite2-City.mmdb
 *   - /usr/share/GeoIP/GeoLite2-ASN.mmdb
 *
 * References:
 *  - maxmind reader API & types (CityResponse, AsnResponse) — open(), Reader#get() etc.  (npm: "maxmind")
 *  - GeoLite2 database field docs (country, city, location, subdivisions, postal, time_zone)
 *  - GeoLite2 ASN database field docs (autonomous_system_number, autonomous_system_organization)
 */

import maxmind, { CityResponse, AsnResponse, Reader } from 'maxmind';

export type IpLike = string;

/** Normalized result you can log or store for rate-limits/analytics. */
export interface GeoIpResult {
  ip: string;

  // City DB fields (when City DB is present and IP is found)
  countryCode?: string;       // ISO 3166-1 alpha-2 (e.g., "US")
  countryName?: string;       // localized name (en)
  continentCode?: string;     // e.g., "NA"
  regionCode?: string;        // first subdivision ISO code (e.g., "ID" for Idaho)
  regionName?: string;
  cityName?: string;
  postalCode?: string;
  timeZone?: string;          // IANA TZ, e.g., "America/Boise"
  latitude?: number;
  longitude?: number;
  accuracyRadiusKm?: number;  // approximate radius in km

  // ASN DB fields (when ASN DB is present and IP is found)
  asn?: {
    number?: number;          // e.g., 15169
    organization?: string;    // e.g., "Google LLC"
  };

  // Flags / meta
  // Note: Anonymous IPs require a different DB (GeoIP2 Anonymous-IP).
  found: boolean;             // true if any DB yielded data
}

/** Options for creating a GeoIP service. */
export interface GeoIpOptions {
  /** Absolute path to GeoLite2-City.mmdb (recommended). */
  cityDbPath?: string;
  /** Absolute path to GeoLite2-ASN.mmdb (optional). */
  asnDbPath?: string;
  /** Enable file watch & hot-reload of readers when .mmdb changes. */
  watchForUpdates?: boolean;
  /** LRU cache size inside reader (default 10_000). */
  cacheMax?: number;
}

/**
 * Simple service wrapper so you can init once and reuse.
 * Call `close()` on shutdown to release file handles.
 */
export class GeoIpService {
  private city?: Reader<CityResponse>;
  private asn?: Reader<AsnResponse>;

  private constructor(city?: Reader<CityResponse>, asn?: Reader<AsnResponse>) {
    this.city = city;
    this.asn = asn;
  }

  static async create(opts: GeoIpOptions): Promise<GeoIpService> {
    const cacheMax = opts.cacheMax ?? 10_000;
    const watch = !!opts.watchForUpdates;

    const [city, asn] = await Promise.all([
      opts.cityDbPath
        ? maxmind.open<CityResponse>(opts.cityDbPath, {
            cache: { max: cacheMax },
            watchForUpdates: watch,
            watchForUpdatesNonPersistent: true,
          })
        : Promise.resolve(undefined),
      opts.asnDbPath
        ? maxmind.open<AsnResponse>(opts.asnDbPath, {
            cache: { max: cacheMax },
            watchForUpdates: watch,
            watchForUpdatesNonPersistent: true,
          })
        : Promise.resolve(undefined),
    ]);

    return new GeoIpService(city, asn);
  }

  /** Close the underlying readers. */
  async close(): Promise<void> {
    // Current "maxmind" reader does not expose an async close; just drop refs.
    this.city = undefined as any;
    this.asn = undefined as any;
  }

  /** True if input string looks like a valid IPv4 or IPv6 address. */
  static isValidIp(ip: IpLike): boolean {
    return maxmind.validate(ip);
  }

  /**
   * Lookup an IP in City + ASN DBs (whichever are configured).
   * Returns a normalized shape; `found=false` if neither DB has a hit or IP is invalid.
   */
  lookup(ip: IpLike): GeoIpResult {
    const result: GeoIpResult = { ip, found: false };

    if (!GeoIpService.isValidIp(ip)) {
      return result; // invalid ip → not found
    }

    // City lookup
    const cityHit = this.city?.get(ip);
    if (cityHit) {
      result.found = true;
      const countryCode = cityHit.country?.iso_code ?? cityHit.registered_country?.iso_code;
      const countryName = cityHit.country?.names?.en ?? cityHit.registered_country?.names?.en;
      const region = cityHit.subdivisions?.[0];

      result.countryCode = countryCode ?? result.countryCode;
      result.countryName = countryName ?? result.countryName;
      result.continentCode = cityHit.continent?.code ?? result.continentCode;
      result.regionCode = region?.iso_code ?? result.regionCode;
      result.regionName = region?.names?.en ?? result.regionName;
      result.cityName = cityHit.city?.names?.en ?? result.cityName;
      result.postalCode = cityHit.postal?.code ?? result.postalCode;
      result.timeZone = cityHit.location?.time_zone ?? result.timeZone;
      result.latitude = cityHit.location?.latitude ?? result.latitude;
      result.longitude = cityHit.location?.longitude ?? result.longitude;
      if (typeof cityHit.location?.accuracy_radius === 'number') {
        result.accuracyRadiusKm = cityHit.location.accuracy_radius;
      }
      // Note: city name might be missing for some IP ranges; that’s expected.
    }

    // ASN lookup
    const asnHit = this.asn?.get(ip);
    if (asnHit) {
      result.found = true;
      result.asn = {
        number: asnHit.autonomous_system_number,
        organization: asnHit.autonomous_system_organization,
      };
    }

    return result;
  }

  /**
   * Extract a plausible client IP from common proxy headers.
   * Pass Node/Express/Fastify headers object.
   */
  static extractClientIp(headers: Record<string, unknown>): string | undefined {
    const xfwd = String(headers['x-forwarded-for'] ?? headers['X-Forwarded-For'] ?? '');
    // x-forwarded-for may contain a comma-separated list — take the first non-private entry if possible.
    if (xfwd) {
      const candidates = xfwd.split(',').map((s) => s.trim()).filter(Boolean);
      for (const c of candidates) {
        if (GeoIpService.isValidIp(c) && !isPrivateIp(c)) return c;
      }
      // fallback: first valid, even if private
      const anyValid = candidates.find((c) => GeoIpService.isValidIp(c));
      if (anyValid) return anyValid;
    }

    const cf = String(headers['cf-connecting-ip'] ?? '');
    if (cf && GeoIpService.isValidIp(cf)) return cf;

    const xri = String(headers['x-real-ip'] ?? '');
    if (xri && GeoIpService.isValidIp(xri)) return xri;

    return undefined;
  }
}

/** Quick private-IP heuristic (covers common RFC1918/4193 ranges). */
export function isPrivateIp(ip: string): boolean {
  if (!maxmind.validate(ip)) return false;
  // IPv4
  if (ip.includes('.')) {
    const oct = ip.split('.').map((n) => Number(n));
    if (oct.length !== 4 || oct.some((n) => Number.isNaN(n))) return false;
    const [a, b] = oct;
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 127.0.0.0/8 loopback
    if (a === 127) return true;
    // 169.254.0.0/16 link-local
    if (a === 169 && b === 254) return true;
    return false;
  }
  // IPv6 (very small set of common checks)
  const lower = ip.toLowerCase();
  return (
    lower.startsWith('fc') || // fc00::/7 (unique local)
    lower.startsWith('fd') ||
    lower.startsWith('fe80:') || // link-local
    lower === '::1'
  );
}

/** Factory one-liner you can use in Nest provider modules. */
export async function createGeoIpService(opts: GeoIpOptions): Promise<GeoIpService> {
  return GeoIpService.create(opts);
}

// Example default paths you might use in dev (don’t export as constants if paths differ per env):
// const service = await createGeoIpService({
//   cityDbPath: process.env.GEOIP_CITY_DB || '/usr/share/GeoIP/GeoLite2-City.mmdb',
//   asnDbPath: process.env.GEOIP_ASN_DB  || '/usr/share/GeoIP/GeoLite2-ASN.mmdb',
//   watchForUpdates: true,
// });
