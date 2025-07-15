import type { CardProps } from '../../types/card'

/**
 * ### NetworkingCards
 *
 * @remarks Comprehensive catalog of networking technologies used by Helix AI.
 * Each card entry is fully annotated with TSDoc so IDE IntelliSense can surface
 * rich hover‑tooltips when the constants are imported.
 *
 * @example
 * ```ts
 * import { NetworkingCards } from "@/constants/technology/networking";
 * // Hovering `NetworkingCards` or any `listItems[0]` property in VS Code now
 * // reveals detailed descriptions thanks to per‑property tags below.
 * ```
 */
export const NetworkingCards: CardProps[] = [
  {
    /**
     * @property title Card heading shown in the UI.
     * @property description One‑sentence category overview.
     * @property listItems Array of technology entries (see nested docs).
     * @property image CDN path to illustrative PNG icon.
     * @property link Internal route for deep‑dive page.
     * @property buttonText Label for call‑to‑action button.
     */
    title: 'Networking & CDN',
    description:
      'Edge delivery, service meshes, load‑balancers, and cloud‑native networking stacks that connect Helix AI services to users worldwide.',
    listItems: [
      {
        /**
         * @property text Display name of the technology.
         * @property href Canonical documentation or homepage URL.
         * @property role Concise functional label for quick scanning.
         * @property detailedDescription Release‑quality blurb (≤ 3 sentences).
         */
        text: 'Cloudflare',
        href: 'https://www.cloudflare.com/',
        role: 'Global Anycast CDN',
        detailedDescription:
          'Cloudflare&apos;s Anycast network spans 310 PoPs (May 2025) delivering static assets, WAF, DDoS mitigation, and Zero‑Trust tunnelling while providing analytics and rate limiting at the edge.',
      },
      {
        text: 'Cloudflare Workers',
        href: 'https://workers.cloudflare.com/',
        role: 'Edge Serverless Runtime',
        detailedDescription:
          'Workers run V8 isolates in under 5 ms cold‑start across Cloudflare&apos;s global edge. The 2025 Smart Placement feature pushes compute closer to origin latency zones, and AI Gateway allows streamed inference with on‑PoP caching.',
      },
      {
        text: 'Fastly',
        href: 'https://www.fastly.com/',
        role: 'Programmable CDN',
        detailedDescription:
          'Fastly&apos;s Compute@Edge executes WebAssembly modules with <50 ms cold‑start, supports KV & object storage, and offers real‑time logging, shielding, and advanced TLS cert automation.',
      },
      {
        text: 'NGINX Ingress Controller 3.1',
        href: 'https://docs.nginx.com/nginx-ingress-controller/',
        role: 'Kubernetes Ingress & Gateway',
        detailedDescription:
          'NGINX Ingress Controller 3.1 (Mar 2025) adds Gateway API Gamma, dynamic mTLS rotation, and enhanced Prometheus metrics, acting as a high‑performance L7 load‑balancer for Kubernetes clusters.',
      },
      {
        text: 'Envoy Proxy 1.33',
        href: 'https://www.envoyproxy.io/',
        role: 'L7 Proxy / Sidecar',
        detailedDescription:
          'Envoy 1.33 (Feb 2025) stabilizes WASM filters, enables HTTP/3 HCM, and introduces adaptive concurrency controls, serving as the core data plane for meshes like Istio and Consul.',
      },
      {
        text: 'Istio 1.23',
        href: 'https://istio.io/',
        role: 'Service Mesh',
        detailedDescription:
          'Istio 1.23 (Apr 2025) finalizes ambient sidecar‑less dataplane, halves resource footprint, and integrates Kubernetes Gateway API for unified ingress and east‑west traffic management with mTLS.',
      },
      {
        text: 'Cilium 1.16',
        href: 'https://cilium.io/',
        role: 'eBPF CNI & Mesh',
        detailedDescription:
          'Cilium 1.16 (Feb 2025) replaces kube‑proxy via eBPF, offers L7 Kafka policies, and graduates Mesh mode with Envoy‑free Hubble observability for high‑performance networking.',
      },
      {
        text: 'Consul Service Mesh 1.18',
        href: 'https://www.consul.io/',
        role: 'Service Mesh & Discovery',
        detailedDescription:
          'Consul 1.18 (Jan 2025) enhances Mesh Gateway federation, embeds wasm‑based traffic filters, and supports xDS sync, enabling zero‑trust service‑to‑service connectivity across multi‑cluster and multi‑cloud environments.',
      },
      {
        text: 'cloudflared 2025.4.0',
        href: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/',
        role: 'Secure Tunnel Connector',
        detailedDescription:
          'cloudflared 2025.4 adds QUIC multiplex transport, automatic token refresh, and Kubernetes sidecar mode, creating outbound Zero‑Trust tunnels that expose services without public ingress IPs.',
      },
    ],
    image:
      'https://cdn.sinlessgamesllc.com/Helix-AI/images/technology/Networking-&-CDN.png',
    link: '/Technology/networking',
    buttonText: 'Explore networking',
  },
]
