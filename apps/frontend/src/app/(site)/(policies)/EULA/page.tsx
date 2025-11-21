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

export default function EulaPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={700}>
            Helix AI Intelligence Platform — End-User License Agreement (EULA)
          </Typography>
          <Typography color="text.secondary">Effective Date: November 20, 2025</Typography>
          <Typography color="text.secondary">Entity: SinLess Games LLC</Typography>
          <Typography color="text.secondary">Contact: support@sinlessgames.com</Typography>
          <Typography color="text.secondary">Governing Law: Idaho, United States</Typography>
          <Typography color="text.secondary">Arbitration: Idaho (see Section 18)</Typography>
        </Stack>
        <Divider />
        <Stack spacing={3}>
          <Section
            title="1. Introduction"
            body={
              <>
                <p>
                  This End-User License Agreement (“EULA,” “Agreement”) governs the use of the Helix AI Intelligence
                  Platform (“Helix,” “Software,” “Service”), provided by SinLess Games LLC (“Licensor,” “we,” “us”).
                  By installing, accessing, or using Helix—including SaaS, downloadable components, mobile apps, APIs,
                  AI agents, Discord bot, plugins, or self-hosted packages—you agree to be bound by this EULA. If you do
                  not agree, do not use Helix.
                </p>
              </>
            }
          />
          <Section
            title="2. Scope of the Agreement"
            body={
              <ul>
                <li>SaaS platform, web app, and cloud services</li>
                <li>APIs, AI agents, integrations, and plugins</li>
                <li>Desktop and mobile applications</li>
                <li>Downloadable binaries and self-hosted components</li>
                <li>Discord bot and all communication interfaces</li>
                <li>Documentation, branding, and intellectual property</li>
                <li>Future modules, features, and automatic updates</li>
              </ul>
            }
          />
          <Section
            title="3. Open-Core Licensing Model"
            body={
              <ol>
                <li>Core components licensed under Modified Apache 2.0 License – SinLess Games LLC Edition.</li>
                <li>Premium modules, cloud systems, AI models, datasets, pipelines, SaaS features, analytics engines, and proprietary code remain proprietary.</li>
                <li>Users must comply with all open-source license terms for open components.</li>
                <li>The overall Helix Platform is licensed, not sold.</li>
              </ol>
            }
          />
          <Section
            title="4. License Grant"
            body={
              <ul>
                <li>Non-exclusive, non-transferable, non-sublicensable, revocable, worldwide, perpetual until terminated.</li>
                <li>Use on unlimited devices; commercial use requires an approved commercial license.</li>
              </ul>
            }
          />
          <Section
            title="5. Ownership"
            body={
              <>
                <p>All software, models, code, infrastructure, design, tools, branding, documentation, and related IP remain property of SinLess Games LLC or its licensors.</p>
                <p>You receive a license, not ownership. Users own all AI-generated output (right to publish/monetize), but do not own Helix models, training data, weights, architecture, infrastructure, or branding.</p>
              </>
            }
          />
          <Section
            title="6. User Rights"
            body={
              <ul>
                <li>Install on multiple devices</li>
                <li>Use for personal and commercial activity (commercial license required)</li>
                <li>Build plugins, addons, and extensions</li>
                <li>Interact with APIs</li>
                <li>Use and own AI outputs you generate</li>
              </ul>
            }
          />
          <Section
            title="7. Prohibited Activities"
            body={
              <ol>
                <li>Resell Helix or components</li>
                <li>Redistribute proprietary parts</li>
                <li>Modify, disassemble, or reverse-engineer the Software</li>
                <li>Build/assist competing AI platforms using Helix models, APIs, outputs, architecture, data, design, or insights</li>
                <li>Use for illegal activity</li>
                <li>Circumvent security, rate limits, licensing controls, or quotas</li>
                <li>Use outputs as legal, medical, or financial advice</li>
              </ol>
            }
          />
          <Section
            title="8. Automatic Updates"
            body={
              <ul>
                <li>Helix may install, modify, update, patch, or remove features automatically, without notification or permission.</li>
                <li>Applies to SaaS, desktop/mobile clients, AI models, infrastructure, and backend systems.</li>
                <li>Users cannot disable automatic updates.</li>
              </ul>
            }
          />
          <Section
            title="9. Privacy, Data Handling & Monitoring"
            body={
              <>
                <p>Users agree to the Helix Privacy Policy and Data Policy (data collection, storage, encryption, retention, logging, parental controls, law-enforcement compliance). All data encrypted in transit and at rest.</p>
              </>
            }
          />
          <Section
            title="10. License Termination"
            body={
              <>
                <p>SinLess Games LLC may immediately terminate your license for abuse, security threats, reverse engineering, non-payment, violations of this EULA or law, platform misuse, interference with system integrity, or competing with Helix using Helix systems.</p>
                <p>Termination ends your license, may revoke access to SaaS/APIs, and no refunds are issued.</p>
              </>
            }
          />
          <Section
            title="11. Disclaimers"
            body={
              <ul>
                <li>Helix is “AS IS” and “AS AVAILABLE.” No warranties (merchantability, fitness, accuracy, reliability, availability, security, non-infringement).</li>
                <li>AI-generated content may be incorrect, unsafe, or misleading; the service may have outages or limitations; outputs should not be relied on for professional purposes.</li>
              </ul>
            }
          />
          <Section
            title="12. Limitation of Liability"
            body={
              <ul>
                <li>Maximum liability is $0, or where prohibited, limited to fees paid in the past 30 days.</li>
                <li>Not liable for data loss, AI mistakes, indirect/incidental/punitive/special/consequential damages, or lost revenue/business/clients/reputation.</li>
                <li>Sole remedy is to stop using Helix.</li>
              </ul>
            }
          />
          <Section
            title="13. U.S. Export Control Compliance"
            body={
              <>
                <p>Comply with EAR, OFAC sanctions, denied/restricted parties, and export controls involving AI, encryption, and dual-use tech. Helix may not be used in embargoed nations or by prohibited individuals.</p>
              </>
            }
          />
          <Section
            title="14. Updates to This EULA"
            body="SinLess Games LLC may update this EULA at any time. Changes take effect immediately upon posting. Continued use constitutes acceptance."
          />
          <Section
            title="15. Enterprise Use"
            body="Enterprise use requires a separate written agreement (custom licensing, support SLAs, on-prem, audit rights, indemnification, usage guarantees). This EULA governs non-enterprise users."
          />
          <Section
            title="16. Support & Contact"
            body="For support or licensing: SinLess Games LLC — support@sinlessgames.com"
          />
          <Section
            title="17. Governing Law"
            body="Idaho law governs this Agreement, without regard to conflict-of-law principles."
          />
          <Section
            title="18. Arbitration"
            body="Disputes resolved by binding arbitration in Idaho, USA. If arbitration is unenforceable, Idaho courts have exclusive jurisdiction."
          />
          <Section
            title="19. Entire Agreement"
            body="This EULA plus the Terms of Service, Privacy Policy, and Data Policy constitutes the entire agreement regarding Helix."
          />
        </Stack>
      </Stack>
    </Container>
  );
}
