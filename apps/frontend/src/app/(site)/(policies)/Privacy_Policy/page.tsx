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

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={700}>
            Privacy Policy
          </Typography>
          <Typography color="text.secondary">Helix AI Intelligence Platform — Privacy Policy</Typography>
          <Typography color="text.secondary">Effective Date: November 20, 2025</Typography>
          <Typography color="text.secondary">Entity: SinLess Games LLC</Typography>
          <Typography color="text.secondary">Contact: support@sinlessgames.com</Typography>
        </Stack>
        <Divider />
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Section
            title="1. Introduction"
            body={
              <>
                <p>
                  This Privacy Policy explains how the Helix AI Intelligence Platform (“Helix,” “we,” “our,” “us”)
                  collects, uses, stores, and shares data. Helix is a product of SinLess Games LLC and operates primarily
                  under Idaho law, with compliance to applicable local, national, and international regulations. By using
                  Helix, you consent to this Privacy Policy.
                </p>
              </>
            }
          />
          <Section
            title="2. Scope of the Policy"
            body={
              <ul>
                <li>Helix Web App</li>
                <li>Helix API</li>
                <li>Helix AI Agents</li>
                <li>Helix Discord Bot</li>
                <li>Helix Mobile Applications</li>
                <li>Helix Plugins, Extensions, and Integrations</li>
                <li>All Helix cloud, cluster, and edge infrastructure</li>
              </ul>
            }
          />
          <Section
            title="3. Data Ownership"
            body={
              <>
                <p>
                  Users retain ownership of all data associated with their account, including submitted data, AI inputs,
                  AI outputs, usage logs, and metadata from interactions. Helix acts as a processor and custodian of
                  user-owned data.
                </p>
              </>
            }
          />
          <Section
            title="4. Data We Collect"
            body={
              <Stack spacing={1} component="div">
                <Typography fontWeight={600}>4.1 Account &amp; Identity Information</Typography>
                <ul>
                  <li>Username, email, password (hashed)</li>
                  <li>OAuth details (Google, Discord, GitHub, etc.)</li>
                  <li>Age verification status</li>
                  <li>Parental control information (if applicable)</li>
                </ul>
                <Typography fontWeight={600}>4.2 Usage &amp; Interaction Data</Typography>
                <ul>
                  <li>Prompts, responses, messages, generated content</li>
                  <li>Logs of interactions across Helix services</li>
                  <li>Automation, script, and workflow activity</li>
                  <li>Plugin usage and integrations</li>
                  <li>Files and attachments submitted</li>
                </ul>
                <Typography fontWeight={600}>4.3 Device &amp; Technical Data</Typography>
                <ul>
                  <li>IP address, browser/OS metadata, device identifiers</li>
                  <li>Network and performance telemetry</li>
                  <li>Error logs and diagnostic data</li>
                </ul>
                <Typography fontWeight={600}>4.4 Behavioral &amp; Analytics Data</Typography>
                <ul>
                  <li>Feature usage, preferences, activity patterns</li>
                  <li>AI model interaction statistics</li>
                </ul>
                <Typography fontWeight={600}>4.5 Payment &amp; Subscription Data</Typography>
                <ul>
                  <li>Handled via third-party processors (e.g., Stripe, PayPal)</li>
                  <li>Helix does not store full payment card information</li>
                </ul>
              </Stack>
            }
          />
          <Section
            title="5. How We Use Collected Data"
            body={
              <ul>
                <li>Operating and maintaining Helix</li>
                <li>Improving AI systems, models, responses, and accuracy</li>
                <li>Personalization and feature optimization</li>
                <li>Security, fraud detection, abuse prevention</li>
                <li>Legal compliance, analytics, telemetry, QA</li>
                <li>Parental control features and access limitations</li>
                <li>Account management and subscription services</li>
                <li>We do not sell or rent user data to third parties.</li>
              </ul>
            }
          />
          <Section
            title="6. Data Sharing"
            body={
              <Stack spacing={1} component="div">
                <Typography fontWeight={600}>6.1 Law Enforcement</Typography>
                <p>Data can be shared with law enforcement when required by applicable laws, subpoenas, or legal processes.</p>
                <Typography fontWeight={600}>6.2 Third-Party Providers</Typography>
                <p>Limited data may be shared with hosting, cloud, payment, or error-monitoring providers as needed. We do not sell data.</p>
                <Typography fontWeight={600}>6.3 Internal Use Only</Typography>
                <p>Data remains internal to SinLess Games LLC except where required by law or essential third-party operations.</p>
              </Stack>
            }
          />
          <Section
            title="7. Data Security"
            body={
              <ul>
                <li>All data encrypted in transit (TLS)</li>
                <li>All data encrypted at rest (AES-256 or equivalent)</li>
                <li>Access logged and restricted; regular audits and automated controls</li>
              </ul>
            }
          />
          <Section
            title="8. Age Verification & Parental Controls"
            body={
              <>
                <p>Helix has age verification systems and parental control features to restrict or monitor access. Helix does not set its own age requirement but respects local laws.</p>
              </>
            }
          />
          <Section
            title="9. Data Retention"
            body={
              <>
                <p>User data may be kept up to 4 years after account deletion, depending on legal obligations. Some logs may be retained longer for security, auditing, fraud prevention, or law enforcement requirements.</p>
              </>
            }
          />
          <Section
            title="10. User Rights"
            body={
              <ul>
                <li>Access: request a copy of your data</li>
                <li>Correction: update incorrect or outdated data</li>
                <li>Deletion: request deletion (subject to retention rules)</li>
                <li>Export: export your data when technically feasible</li>
              </ul>
            }
          />
          <Section
            title="11. Data Transfers"
            body="Data may be stored in the US (primary) and other jurisdictions as required. All transfers are encrypted and compliant with relevant laws."
          />
          <Section
            title="12. AI Models and Data Usage"
            body="Helix AI systems may use user data to train or fine-tune models, improve accuracy, safety, and performance, and enhance personalization. Users own their generated data but grant Helix a license to process it for platform functionality."
          />
          <Section
            title="13. Changes to the Privacy Policy"
            body="SinLess Games LLC may update this Privacy Policy at any time. Changes take effect immediately upon posting. Continued use constitutes acceptance."
          />
          <Section
            title="14. Contact"
            body="For questions or privacy inquiries: SinLess Games LLC — support@sinlessgames.com"
          />
        </Box>
      </Stack>
    </Container>
  );
}
