"use client";

import React from "react";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // MUI v6 Grid (new API with `size`)

export default function NHPPage() {
  return (
    <Box component="main" sx={{ p: { xs: 2, sm: 4, md: 6 }, gap: 3 }}>
      <Typography variant="h3" gutterBottom>
        Helix as a Non-Human Person (NHP)
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        “NHP” is an operational concept, not a legal status. Helix behaves like a responsible teammate—
        with duties, guardrails, and human oversight—while legal accountability remains with people and organizations.
        It does not sign contracts, own rights, or assume liability; those remain with authorized humans and the
        organizations that deploy and supervise Helix. In practice, the NHP framing means four things: (1) clear
        identity and disclosure in every interaction; (2) explicit capability boundaries aligned to law and policy;
        (3) auditable actions that are attributable to a human owner or team; and (4) built-in escalation paths,
        kill-switches, and safe rollbacks when conditions degrade. This definition guides our architecture,
        governance, and UX without asserting legal personhood.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Quick Pillars */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[ 
          { h: "Identity", b: "Intro banner/voice pre-roll at session start, a persistent &apos;AI&apos; badge in UI, contextual reminders before sensitive actions, and a &apos;Why you&apos;re seeing this&apos; link to policy details." },
          { h: "Provenance", b: "Visible labels on AI-generated/edited content, embedded Content Credentials (C2PA) in downloadable files, plus a &apos;View provenance&apos; panel and export API exposing tools used, sources, and model versions." },
          { h: "Governance", b: "An AI Management System (AIMS) pursuing ISO/IEC 42001 certification; controls mapped to NIST AI RMF/GenAI profile; documented model cards, risk & impact assessments, supplier reviews, and internal audits tied to CI/CD gates." },
          { h: "Oversight", b: "Human approval for high-risk actions, dual-control for financial/security operations, emergency kill-switch roles, automated rollbacks/pauses on SLO breach, and complete audit trails with post-incident reviews." },
        ].map((c) => (
          <Grid key={c.h} size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {c.h}
                </Typography>
                <Typography variant="body2" color="text.secondary">{c.b}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Identity & Disclosure */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main" }}>
        Identity & Disclosure
      </Typography>
      <Typography paragraph>
        Helix always identifies itself as AI at session start—across every chat channel and voice interface—via an intro banner 
        (chat) or spoken pre-roll (voice), and it displays a persistent “AI” badge beside the avatar and name. Before sensitive 
        actions (e.g., financial operations, code execution, data deletion), Helix surfaces a contextual reminder and links to 
        “Why you&apos;re seeing this.” Users can open a Provenance panel for each message to review how the response was produced: 
        model family and version, tool/function calls, external API endpoints, retrieval sources with timestamps/identifiers, 
        and any post-processing steps. Downloadable assets include embedded Content Credentials (C2PA) and cryptographic hashes; 
        the panel also exposes machine-readable provenance (JSON) for export APIs. When content is streamed or summarizes your 
        data, the panel highlights applicable privacy scope and retention windows.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Disclosure is universal by design. No impersonation, no hidden agents, no dark patterns.
      </Alert>

      {/* Provenance */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Provenance & Content Credentials
      </Typography>
      <Typography paragraph>
        AI-generated or modified content is <strong>visibly labeled</strong> in the UI, and every downloadable asset carries a
        cryptographically verifiable <strong>Content Credential</strong> (C2PA Manifest). This manifest binds signed assertions—
        such as the asset&apos;s origin, edit history, model/tool identifiers, timestamps, and a cryptographic hash of the file—so
        downstream systems can verify <em>what</em> was produced, <em>how</em>, and <em>by whom</em>. Helix stores the active manifest
        with the asset and includes a machine-readable <code>provenance.json</code> alongside exports, plus a human-readable summary
        in the “View provenance” panel. Labels and credentials satisfy transparency duties (e.g., deepfake/AI-content notices),
        while a layered approach (visible badges + signed manifests) avoids the fragility of watermark-only schemes.
      </Typography>

      {/* Public Turing Milestone */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Public Turing Milestone
      </Typography>
      <Typography paragraph>
        Helix will run a <strong>public conversational-fidelity challenge</strong>—our modern take on the “Turing test”—with
        a published protocol, datasets, and scoring. Evaluations use <em>blind, pairwise comparisons</em> against
        strong baselines and human references; judges see anonymized responses and vote on which is better for
        helpfulness, clarity, grounding, and safety. We report <strong>win-rate metrics</strong> using Elo/Bradley–Terry style
        rating curves with confidence intervals, plus secondary scores (factuality, refusal appropriateness,
        citation quality, latency). All prompts, votes, and rubrics are released for reproducibility.
      </Typography>
      <Typography paragraph>
        Participation includes <strong>explicit disclosure that Helix is AI</strong> in every interaction and visible labeling
        of AI-generated content. The challenge follows recognized evaluation practices (public protocol, transparent
        leaderboards, human-preference aggregation) and aligns with <strong>risk-management guidance</strong> (red-team prompts,
        harm/benefit tracking, incident reporting). Leaderboards celebrate human-like performance <em>without deception</em>:
        no impersonation, provenance is preserved, and all model/tool versions used in the runs are documented.
      </Typography>

      {/* Governance & Certification */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Governance & Certification
        </Typography>
        <Typography paragraph>
        Helix operates an <strong>AI Management System (AIMS)</strong> and targets <strong>ISO/IEC 42001</strong> certification. The AIMS
        formalizes policy, roles, risk processes, model lifecycle controls, data governance, supplier oversight, human oversight,
        incident management, and continual improvement. Controls are mapped to the <strong>NIST AI RMF</strong> core functions
        (Govern, Map, Measure, Manage) and the <strong>NIST Generative AI Profile (AI 600-1)</strong>, then enforced as
        <em>must-pass CI/CD gates</em> (model cards & evaluations with thresholds, bias/fairness checks, red-team suites,
        change control with approvals, SBOM/attestation & provenance signing, rollout guardrails, and post-deploy monitoring with SLOs/error budgets).
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
        Timeline to Certification
        </Typography>
        <List dense>
        <ListItem>
            <ListItemText
            primary="0–30 days"
            secondary="Run a gap assessment; define AIMS scope (systems, teams, suppliers); appoint an AIMS owner and risk officer; stand up a risk register and control map."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="30–90 days"
            secondary="Publish policies (risk, data & access, model lifecycle, incident, third-party); perform AI impact/risk assessments (link DPIAs where applicable); wire checks into CI/CD (eval gates, red-team jobs, SBOM/provenance)."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="90–180 days"
            secondary="Conduct internal audits & management review; evidence supplier due-diligence; address findings; select a certification body and schedule Stage 1/2 audits."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="180–270 days"
            secondary="Stage 1 (readiness/document) audit; remediate nonconformities; finalize objective-evidence library (tickets, pipelines, dashboards) and sampling plan."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="270–360 days"
            secondary="Stage 2 (implementation/effectiveness) audit across selected services/releases; close majors/minors; certification decision & certificate issuance."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Ongoing"
            secondary="Surveillance audits annually; quarterly management reviews; CAPA tracking; recertification every 3 years."
            />
        </ListItem>
        </List>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
        Required Artifacts (evidence)
        </Typography>
        <List dense>
        <ListItem>
            <ListItemText primary="Policy Set & Roles" secondary="AIMS policy, risk policy, data governance, model lifecycle/SDE, incident response; RACI for owners/approvers." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Risk & Impact" secondary="Risk register with treatment plans; AI impact assessments; jurisdictional constraints; supplier risk reviews and SLAs." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Lifecycle Controls" secondary="Model cards, evaluation reports, red-team results, approval records, rollout/rollback criteria, change logs." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Data & Access" secondary="Data inventory, retention schedules, PII handling, access reviews, encryption/key-management evidence." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Operations & Monitoring" secondary="SLOs/error budgets, alerts, incident tickets, post-incident reviews, and continuous-monitoring dashboards (metrics/logs/traces)." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Supplier Oversight" secondary="Third-party due-diligence, shared-controls matrix, penetration reports, vulnerability remediations, attestation letters." />
        </ListItem>
        </List>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
        CI/CD Gates (examples)
        </Typography>
        <List dense>
        <ListItem>
            <ListItemText primary="Evaluation thresholds" secondary="Block deploys if task metrics (helpfulness, grounding, refusal appropriateness) or safety scores fall below targets." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Bias/fairness" secondary="Run sensitive-attribute stress tests; fail on regressions; attach reports to change requests." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Red-team suites" secondary="Execute jailbreak/toxicity/leakage prompts on each model update; require sign-off on mitigations." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Supply chain" secondary="Generate SBOMs; verify signatures/attestations; enforce provenance (e.g., C2PA) for generated assets." />
        </ListItem>
        <ListItem>
            <ListItemText primary="Release & rollback" secondary="Canary with health/SLO guards; automatic rollback criteria; audit trails for approvals and exceptions." />
        </ListItem>
        </List>

        {/* References:
        - ISO/IEC 42001 overview: https://www.iso.org/standard/42001
        - NIST AI RMF Core (Govern/Map/Measure/Manage): https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
        - NIST Generative AI Profile (AI 600-1): https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
        */}


      {/* Regulatory Guardrails */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Regulatory Guardrails (EU AI Act & Global Baselines)
        </Typography>
        <Typography paragraph>
        We implement <strong>global-by-default transparency</strong> and <strong>content labeling</strong> so the product posture
        is consistent across regions. EU AI Act timelines are mirrored behind <em>jurisdiction flags</em> and enforced in
        code (feature gates, policies, rollout checks). Prohibited or restricted uses are disabled at the edge and in
        workflows. Concretely:
        </Typography>
        <List dense>
        <ListItem>
            <ListItemText
            primary="GPAI model duties (EU)"
            secondary="From Aug 2, 2025, general-purpose AI providers must meet transparency/copyright obligations when placing models on the EU market; models already on the market by that date must comply by Aug 2, 2027."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Article 50 transparency (EU)"
            secondary="By Aug 2, 2026, Helix surfaces ‘you’re interacting with AI’ notices and deepfake/synthetic-content labels; provenance is exposed in-product and via export APIs."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Prohibited practices (EU)"
            secondary="We hard-block social scoring, untargeted scraping to build facial-recognition databases, and emotion-recognition in workplaces or schools; guardrails ship as default policies and compile-time feature flags."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Baselines outside the EU"
            secondary="Controls align to NIST AI RMF (Govern/Map/Measure/Manage) and the Generative AI Profile; OECD AI Principles guide transparency and accountability; ISO/IEC 42001 anchors our management system."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Provenance & labeling"
            secondary="We pair visible labels with signed Content Credentials in downloads; U.S. EO 14110/NIST guidance informs our synthetic-content controls (e.g., provenance over watermark-only schemes)."
            />
        </ListItem>
        </List>


      {/* Ethics & Empathy */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Ethics & Empathy Boundaries
        </Typography>
        <Typography paragraph>
        Helix treats empathy as <strong>helpful communication behaviors</strong>—clear tone, respectful phrasing, and context-aware
        guidance—rather than claims to sense or “know” feelings. By default, Helix does <strong>not</strong> perform affect or biometric
        inference (e.g., emotion recognition from faces, voices, or keystrokes). Any sentiment signals derived from user-provided
        text are <em>assistive heuristics</em> with disclaimers, not diagnostics, and are never used to gate access, rank people, or
        make eligibility decisions.
        </Typography>
        <Typography paragraph>
        Features that could touch on affect are <strong>opt-in only</strong> with plain-language consent (purpose, retention, and on/off
        controls). We apply <strong>data minimization</strong> (process locally when possible, avoid persistent “emotional profiles,” short
        retention) and provide a single switch to disable these behaviors across channels at any time. Prompts and responses are
        phrased to avoid anthropomorphism—Helix does not claim to have feelings—and sensitive contexts trigger <strong>human-in-the-loop</strong>
        escalation paths.
        </Typography>
        <Typography paragraph>
        Jurisdictional and contextual guardrails are enforced in code: emotion/biometric recognition is <strong>blocked</strong> in
        workplaces and schools, and prohibited or high-risk uses are disabled by default, with policy and feature flags adapting
        to regional law. Evaluation includes cultural-variance reviews and bias checks to reduce misinterpretation across
        populations, aligning with recognized AI ethics frameworks on human dignity, transparency, and accountability.
        </Typography>


      {/* Accountability */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Accountability & Oversight
        </Typography>
        <Typography paragraph>
        Every Helix action is <strong>attributable to a human or accountable organization</strong>. Requests run under
        signed identities (user or service principals) and produce <strong>tamper-evident audit records</strong>.
        Sensitive operations follow <strong>separation of duties</strong> and, where warranted, <strong>dual authorization</strong>
        (two-person approval) before execution. Oversight is continuous: approvals, rationale, and evidence are
        captured; policy-as-code gates block out-of-policy changes; and on-call reviewers can pause or roll back activity
        at any time.
        </Typography>
        <Typography paragraph>
        Emergency controls are built in: <strong>fail-safes</strong> abort on unsafe signals, <strong>deadman switches</strong> stop long-running
        workflows without heartbeat, and <strong>automated rollback</strong> returns to a known-good state when health or SLO guards
        trip. Audit logs are cryptographically verifiable and exported to centralized observability/SECOPS pipelines with
        <strong>retention and access reviews</strong>. Post-incident reviews feed CAPA and model/product changes.
        </Typography>
        <List dense>
        <ListItem>
            <ListItemText
            primary="Attributable identities & signatures"
            secondary="Requests carry user/service claims; responses and side effects are linked to those claims and signed for non-repudiation."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Human approval & dual-control"
            secondary="High-risk actions (finance, security, privacy) require human review; dual authorization (two approvers) is enforced for especially sensitive operations."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Separation of duties"
            secondary="No single role can request, approve, and deploy a risky change; duties are partitioned across distinct principals."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Change management & rollback"
            secondary="Progressive delivery with canary analysis and metrics-driven rollback; automatic pauses/rollbacks on health or SLO breach."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Tamper-evident audit & retention"
            secondary="Append-only logs with integrity digests/hash-chaining; centralized storage, retention policies, and periodic access reviews."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Real-time monitoring & escalation"
            secondary="Alerts for policy violations or anomalous behavior route to on-call; break-glass access is time-bound, recorded, and reviewed."
            />
        </ListItem>
        </List>

        {/* References (for maintainers):
        - NIST AI RMF (govern/manage oversight & continuous monitoring). :contentReference[oaicite:0]{index=0}
        - EU AI Act Article 14 (human oversight requirements for high-risk contexts). :contentReference[oaicite:1]{index=1}
        - NIST SP 800-53 r5 AC-5 (Separation of Duties) and AC-3(2) (Dual Authorization). :contentReference[oaicite:2]{index=2}
        - Tamper-evident logging (NIST SP 800-92) and AWS CloudTrail digest integrity validation. :contentReference[oaicite:3]{index=3}
        - Progressive delivery & automatic rollback with Flagger. :contentReference[oaicite:4]{index=4}
        - SLOs/error budgets for guardrails & rollback triggers (Google SRE). :contentReference[oaicite:5]{index=5}
        */}


      {/* Legal Reality */}
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Legal Reality of “NHP”
        </Typography>
        <Typography paragraph>
        “Non-Human Person” is a <strong>design metaphor</strong>, not a claim of legal standing. Today, AI systems are
        <strong>not recognized as legal persons</strong> and cannot independently <em>own property, sign contracts, file lawsuits,
        or be listed as inventors/authors</em>. All duties and liabilities attach to the <strong>human operators and organizations</strong>
        that deploy and supervise Helix. Practically, that means: (1) Helix never executes binding legal acts on its own;
        (2) a responsible human identity (or service principal controlled by humans) approves sensitive actions; and
        (3) authorship/inventorship and product liability are handled under existing human-centric frameworks.
        </Typography>
        <Typography paragraph>
        Helix’s UX and policies reflect this reality: clear identity disclosure; human sign-off paths for high-risk actions;
        and provenance/audit trails that attribute every effect to accountable people or entities. Where jurisdictions impose
        specific obligations (e.g., transparency for synthetic media, model documentation, product liability for software/AI),
        Helix ships with <strong>jurisdiction flags</strong> and default-deny policies to keep behavior compliant without implying
        personhood.
        </Typography>
        {/* References for maintainers:
        - Thaler v. Vidal (Fed. Cir. 2022): AI cannot be a patent inventor (legal personhood/inventorship boundaries).
        - U.S. Copyright Office guidance (2023–2025): human authorship required; AI-assisted works must disclose scope.
        - EU AI Act Article 50: disclosure/labeling of AI interactions and synthetic content.
        - EU Product Liability Directive (2024 update): explicitly covers software/AI; liability flows to economic operators.
        */}

        {/* Implementation Checklist */}
        <Typography variant="h5" gutterBottom sx={{ color: "primary.main", pt: 3 }}>
        Implementation Checklist
        </Typography>
        <List dense>
        <ListItem>
            <ListItemText
            primary="Disclosure"
            secondary="Intro banner/voice pre-roll + persistent AI badge in all channels; contextual reminders before sensitive actions; clear ‘Helix is AI’ language in contracts, UI, and voice."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Provenance"
            secondary="Visible AI labels in-product; embedded Content Credentials (C2PA) and hashes in downloads; machine-readable provenance.json in exports/APIs; link each action to a human/controller."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Jurisdiction Flags"
            secondary="Feature flags for EU AI Act transparency and prohibited-use blocks; product-liability posture by region; regional data retention/consent defaults; ban impersonation globally."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Risk Controls"
            secondary="NIST-aligned eval gates (grounding/helpfulness/safety), red-teaming and incident playbooks in CI/CD; change control with approvals; canary + automatic rollback on SLO breach."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Oversight"
            secondary="Human approval for high-risk actions; dual-control for finance/security/privacy; kill-switch roles and on-call SLAs documented; tamper-evident audit trails with retention/review."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Authorship & Inventorship"
            secondary="Collect human-contribution statements for exports; label AI-assisted portions; block attempts to designate AI as an inventor/author; surface guidance in UI for registrations."
            />
        </ListItem>
        <ListItem>
            <ListItemText
            primary="Liability & Terms"
            secondary="Make clear that Helix acts under the deploying organization’s control; include warranty/indemnity and acceptable-use clauses; document supplier controls and incident notification timelines."
            />
        </ListItem>
        </List>


      {/* Chips / Legend */}
      <Box sx={{ mt: 3 }}>
        <Chip label="ISO/IEC 42001" size="small" sx={{ mr: 1 }} />
        <Chip label="NIST AI RMF" size="small" sx={{ mr: 1 }} />
        <Chip label="EU AI Act" size="small" sx={{ mr: 1 }} />
        <Chip label="C2PA" size="small" sx={{ mr: 1 }} />
        <Chip label="Disclosure" size="small" sx={{ mr: 1 }} />
        <Chip label="Provenance" size="small" sx={{ mr: 1 }} />
        <Chip label="Public Turing" size="small" />
      </Box>

      <Divider sx={{ mt: 4 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This page describes Helix&apos;s principles and controls for operating as an NHP-style companion: augmenting,
        enriching, and protecting human life—while keeping humans in charge.
      </Typography>
    </Box>
  );
}
