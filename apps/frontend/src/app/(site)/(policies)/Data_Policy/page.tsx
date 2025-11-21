'use client';

import { Box, Container, Divider, Stack, Typography } from '@mui/material';

type SectionProps = { title: string; body: React.ReactNode };

function Section({ title, body }: SectionProps) {
  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      <Typography color="text.secondary" component="div" sx={{ display: 'grid', gap: 1 }}>
        {body}
      </Typography>
    </Box>
  );
}

export default function DataPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={700}>
            Helix AI Intelligence Platform — Data Policy
          </Typography>
          <Typography color="text.secondary">
            This page summarizes how Helix manages, secures, processes, retains, and governs data.
          </Typography>
          <Typography color="text.secondary">Effective Date: November 20, 2025</Typography>
          <Typography color="text.secondary">Maintained by: SinLess Games LLC</Typography>
          <Typography color="text.secondary">Contact: support@sinlessgames.com</Typography>
        </Stack>
        <Divider />
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Section
            title="1. Purpose and Scope"
            body={
              <>
                <p>
                  This Data Policy defines how Helix AI Intelligence Platform (“Helix,” “we,” “our”) manages, secures,
                  processes, retains, and governs all data across its infrastructure. It reflects Helix’s DevSecOps,
                  security, and legal compliance standards, and applies to all Helix components.
                </p>
                <ul>
                  <li>Web Application</li>
                  <li>API &amp; Backend Services</li>
                  <li>AI Agents and Model Runtimes</li>
                  <li>Discord Bot</li>
                  <li>Mobile Applications</li>
                  <li>Plugins, Integrations, and Extensions</li>
                  <li>Cloud, On-Premise, and Edge Deployments</li>
                  <li>Internal Systems and Administrative Interfaces</li>
                </ul>
                <p>This policy complements and extends the Terms of Service and Privacy Policy.</p>
              </>
            }
          />
          <Section
            title="2. Data Ownership"
            body={
              <>
                <p>User owns all data associated with their account, including inputs and outputs. SinLess Games LLC acts as processor and custodian. Helix processes data only for operation, improvement, security, compliance, and fraud prevention.</p>
                <p>Helix does not claim ownership over user-generated content.</p>
              </>
            }
          />
          <Section
            title="3. Data Categories"
            body={
              <Stack spacing={1} component="div">
                <Typography fontWeight={600}>3.1 User-Provided Data</Typography>
                <ul>
                  <li>Account details</li>
                  <li>AI inputs (messages, prompts, requests)</li>
                  <li>Uploaded files/documents</li>
                  <li>Settings, preferences, configurations</li>
                  <li>Support requests or contacts</li>
                </ul>
                <Typography fontWeight={600}>3.2 System-Generated Data</Typography>
                <ul>
                  <li>AI outputs</li>
                  <li>Usage logs</li>
                  <li>Metadata</li>
                  <li>Error reports</li>
                  <li>Interaction history across services</li>
                </ul>
                <Typography fontWeight={600}>3.3 Technical Telemetry</Typography>
                <ul>
                  <li>IP address</li>
                  <li>Device and OS fingerprints</li>
                  <li>Browser and user-agent strings</li>
                  <li>Network metrics</li>
                  <li>Processed time stamps</li>
                  <li>API activity and rate-limit metrics</li>
                </ul>
                <Typography fontWeight={600}>3.4 Security &amp; Compliance Data</Typography>
                <ul>
                  <li>Authentication logs</li>
                  <li>Audit trails</li>
                  <li>Abuse detection signals</li>
                  <li>Suspicious activity patterns</li>
                  <li>Administrative access logs</li>
                </ul>
                <Typography fontWeight={600}>3.5 Payment &amp; Subscription Data</Typography>
                <ul>
                  <li>Processed via third parties (Stripe, PayPal)</li>
                  <li>Only minimal metadata retained by Helix</li>
                </ul>
                <p>All categories are collected only when technically required for functionality, security, or analytics.</p>
              </Stack>
            }
          />
          <Section
            title="4. Principles of Data Handling"
            body={
              <ul>
                <li>Zero Trust Architecture</li>
                <li>Principle of Least Privilege (PoLP)</li>
                <li>Defense in Depth</li>
                <li>Secure-by-Design / Secure-by-Default</li>
                <li>Compliance with Idaho law first, then other applicable jurisdictions</li>
                <li>Continuous monitoring, logging, and security hardening</li>
              </ul>
            }
          />
          <Section
            title="5. Data Storage &amp; Encryption"
            body={
              <Stack spacing={1} component="div">
                <Typography fontWeight={600}>5.1 Encryption</Typography>
                <ul>
                  <li>In transit: TLS 1.3 or higher</li>
                  <li>At rest: AES-256 or equivalent</li>
                  <li>Secrets handled via KMS/Vault or equivalent</li>
                </ul>
                <Typography fontWeight={600}>5.2 Storage Locations</Typography>
                <ul>
                  <li>Primary storage in the US</li>
                  <li>Secondary/failover locations may be used for reliability</li>
                  <li>All layers hardened against unauthorized access</li>
                </ul>
                <Typography fontWeight={600}>5.3 Data Isolation</Typography>
                <ul>
                  <li>Tenant/domain separation</li>
                  <li>Strict RBAC</li>
                  <li>Administrative actions logged/audited</li>
                  <li>Access only for authorized personnel with valid justification</li>
                </ul>
              </Stack>
            }
          />
          <Section
            title="6. Data Access Controls"
            body={
              <Stack spacing={1} component="div">
                <Typography fontWeight={600}>6.1 Access Model</Typography>
                <ul>
                  <li>RBAC + ABAC</li>
                  <li>Short-lived credentials</li>
                  <li>Device/session-level authorization</li>
                  <li>MFA for administrative roles</li>
                </ul>
                <Typography fontWeight={600}>6.2 Internal Access</Typography>
                <p>Authorized staff only, for a verifiable business need (security, infra, compliance, support). All access is logged and reviewed.</p>
              </Stack>
            }
          />
          <Section
            title="7. Data Use"
            body={
              <ul>
                <li>Core functionality and AI model operation</li>
                <li>Improving system quality, accuracy, performance</li>
                <li>Debugging, analytics, error resolution</li>
                <li>Abuse detection, anti-fraud monitoring</li>
                <li>Compliance with laws; parental control enforcement</li>
                <li>Support and troubleshooting on user request</li>
                <li>We do not sell or rent data.</li>
              </ul>
            }
          />
          <Section
            title="8. Data Sharing"
            body={
              <Stack spacing={1} component="div">
                <Typography fontWeight={600}>8.1 Internal Use Only</Typography>
                <p>Data remains internal to SinLess Games LLC except where legally mandated.</p>
                <Typography fontWeight={600}>8.2 Legal Compliance</Typography>
                <p>Helix will disclose data to law enforcement when required by subpoena, court order, or applicable law, prioritizing Idaho jurisdiction first.</p>
                <Typography fontWeight={600}>8.3 Third-Party Processors</Typography>
                <p>Only minimal data shared with hosting, payment, logging/monitoring, or security services; all are contractually bound to strong security standards.</p>
              </Stack>
            }
          />
          <Section
            title="9. Data Retention"
            body={
              <>
                <p>User data may be retained up to 4 years after account deletion, depending on regulations. Security logs, audit records, and fraud-related data may be retained longer. Data required for legal obligations may be held for statutory periods.</p>
                <p>After retention expires, data is securely deleted, anonymized, or cryptographically shredded.</p>
              </>
            }
          />
          <Section
            title="10. Data Deletion &amp; Export"
            body={
              <ul>
                <li>Users may request export or deletion of data/account.</li>
                <li>Helix complies subject to legal retention, security, and anti-fraud obligations.</li>
                <li>Deletion may be delayed if data is required by law enforcement.</li>
              </ul>
            }
          />
          <Section
            title="11. AI System Data Handling"
            body="Helix AI models may use user data to generate outputs, improve accuracy/safety/efficiency, train sub-models, or perform safety checks. User-owned data is not sold/licensed to third parties for external training. Helix infrastructure is internal and isolated."
          />
          <Section
            title="12. Monitoring, Logging, and Auditing"
            body={
              <ul>
                <li>Full-stack telemetry, real-time intrusion detection, SIEM pipelines</li>
                <li>Audit logs for critical systems; continuous compliance monitoring</li>
                <li>Automated anomaly detection for abuse and threats</li>
              </ul>
            }
          />
          <Section
            title="13. Incident Response"
            body="Formal IRP covering identification, containment, eradication, recovery, forensic review, and user notification if legally required. All incidents documented and reviewed."
          />
          <Section
            title="14. Security Standards &amp; Compliance"
            body={
              <ul>
                <li>NIST Cybersecurity Framework, NIST 800-53</li>
                <li>SOC2 principles, ISO-27001 concepts</li>
                <li>OWASP Top 10, CIS Benchmarks</li>
                <li>Certification may be pursued as the platform grows.</li>
              </ul>
            }
          />
          <Section
            title="15. Age Verification &amp; Parental Controls"
            body="Includes age verification mechanisms, parent/guardian management features, optional content filtering, and compliance systems for minors. Age-related data is encrypted and retained per policy."
          />
          <Section
            title="16. Policy Updates"
            body="This Data Policy may be updated at any time. Changes take immediate effect upon publication. Continued use constitutes acceptance."
          />
          <Section
            title="17. Contact Information"
            body="Questions, compliance requests, or security inquiries: SinLess Games LLC — support@sinlessgames.com"
          />
        </Box>
      </Stack>
    </Container>
  );
}
