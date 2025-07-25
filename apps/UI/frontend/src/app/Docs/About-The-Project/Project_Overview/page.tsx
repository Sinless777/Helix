// user-interfaces/frontend/src/app/Docs/About-The-Project/Project_Overview/page.tsx
'use client'

import { Box, Typography } from '@mui/material'

export default function ProjectOverview() {
  return (
    <Box sx={{ p: 2 }}>
      {/* Page Title */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          justifyContent: 'center',
          display: 'flex',
          textAlign: 'center',
          pb: 5,
        }}
      >
        Project Overview
      </Typography>

      <Box>
        {/* Helix AI Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1 }}>
          🧠 Helix AI
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ pb: 2 }}>
          Helix AI is a next-generation, cloud-native AI companion designed to
          be more than just a tool—it&apos;s a trusted partner in every
          interaction. By combining advanced natural language understanding
          (NLU), sentiment analysis, deep neural network (DNN) models, and
          machine learning (ML) techniques, Helix delivers highly personalized
          guidance tailored to each user&apos;s unique preferences and
          workflows.
          <br />
          <br />
          Whether providing step-by-step troubleshooting, summarizing
          cross-platform meeting notes, or proactively alerting on critical
          system events, Helix uses a hybrid inference model—leveraging a
          proprietary LLM alongside best-of-breed public models—to ensure
          accuracy, reliability, and responsiveness. Its adaptive learning
          engine continuously ingests telemetry, logs, and performance metrics
          to maintain an accurate model of the user&apos;s environment, offering
          contextual suggestions that feel truly intuitive.
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ pb: 2 }}>
          <strong>Key Characteristics:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 2, pb: 4 }}>
          <li>
            <strong>Unified Ecosystem:</strong> Bridges chat platforms (Discord,
            Slack), cloud services (AWS, GCP), version control (GitHub, GitLab),
            and more under a single conversational interface.
          </li>
          <li>
            <strong>Multimodal Interaction:</strong> Supports seamless
            transitions between text, voice, and visual data—enabling voice
            commands, real-time transcription, and data-driven chart generation.
          </li>
          <li>
            <strong>Context Preservation:</strong> Maintains session history,
            cross-channel context, and user intent, allowing Helix to pick up
            conversations exactly where they left off.
          </li>
          <li>
            <strong>Proactive Assistance:</strong> Uses predictive analytics and
            pattern recognition to anticipate user needs—like recommending
            optimizations based on historical usage or flagging anomalies before
            they escalate.
          </li>
          <li>
            <strong>Privacy &amp; Security:</strong> Implements end-to-end
            encryption, role-based access control, and fine-grained data
            governance to ensure user data remains secure and compliant.
          </li>
          <li>
            <strong>Extensible Plugin Architecture:</strong> Allows developers
            to add custom data connectors, workflows, and domain-specific
            skills, fostering a vibrant ecosystem of community-driven
            enhancements.
          </li>
        </Box>

        {/* DevSecOps Overview */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            DevSecOps at Helix AI
          </Typography>
          <Typography variant="body1" gutterBottom>
            At Helix, security and compliance aren’t bolted on at the
            end—they’re woven into every step of our build, test, and deployment
            pipeline. By “shifting left,” we catch vulnerabilities early,
            enforce policy-as-code, and continuously validate that our
            infrastructure and applications meet our stringent standards.
          </Typography>

          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" gutterBottom>
              <strong>Pre-commit Scans &amp; Tests:</strong> ESLint, Prettier,
              SAST (e.g. SonarQube), dependency checks (OWASP, Snyk) and unit
              tests run automatically to block insecure or non-compliant code
              before it even lands in Git.
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              <strong>CI Pipeline Security Gates:</strong> In Jenkins/GitLab CI
              we run container image scans, IaC linters (Terraform, Kubernetes
              policies via Kyverno/OPA), secret detection, and dynamic analysis
              to prevent risky changes from advancing.
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              <strong>Staging &amp; Canary Hardening:</strong> Each deployment
              to staging and canary environments is subject to penetration
              tests, automated security smoke tests, and compliance
              validation—if any test fails, the release is automatically halted
              and rolled back.
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              <strong>Policy-as-Code Enforcement:</strong> Kubernetes RBAC,
              network policies, container runtime restrictions, and cloud IAM
              rules are defined declaratively and enforced via automated
              admission controllers, ensuring drift never compromises our
              zero-trust posture.
            </Typography>
            <Typography component="li" variant="body1" gutterBottom>
              <strong>Continuous Monitoring &amp; Alerts:</strong>
              Post-deployment, Prometheus/Alertmanager and Logstash/Loki
              pipelines watch for anomalies and policy violations in real-time,
              triggering notifications to on-call channels (Discord, PagerDuty,
              Slack).
            </Typography>
          </Box>

          <Typography variant="body1" gutterBottom>
            This holistic DevSecOps approach guarantees that Helix AI’s software
            and infrastructure remain secure, compliant, and resilient while
            still moving at developer speed.
          </Typography>
        </Box>

        {/* Detailed Process Breakdown */}
        <Box sx={{ pl: 2, pb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>1. Pre-commit:</strong> Runs linting (ESLint), formatting
            (Prettier), static analysis (SonarQube), and security scans (OWASP
            Dependency-Check) on staged files. Detected issues cause an
            immediate failure, returning feedback to the developer for
            correction.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>2. Commit &amp; Push:</strong> Commits are pushed to
            protected branches in GitHub/GitLab, triggering branch protection
            rules and automated hooks. Unauthorized pushes or merge attempts are
            blocked to enforce workflow integrity.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>3. Continuous Integration (CI):</strong> The CI pipeline
            (Jenkins/GitLab CI) builds Docker images, executes unit and
            integration tests (Jest, JUnit, pytest), and performs vulnerability
            scanning (Snyk, WhiteSource). Successful builds generate deployable
            artifacts; failures halt progression with detailed logs.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>4. Staging Deployment:</strong> Artifacts are deployed to a
            staging environment via Terraform and Helm. This includes
            performance/load testing (JMeter), automated end-to-end tests
            (Cypress, Selenium), and security validations. Any SLA violations
            trigger alerts and prevent production promotion.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>5. Production Deployment:</strong> Uses a canary release
            strategy orchestrated by Flagger on Kubernetes. A subset of pods
            receives traffic for real-world validation. Health checks and
            Prometheus metrics determine whether to promote or automatically
            roll back the release.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>6. Alerts &amp; Incident Management:</strong> Prometheus
            Alertmanager routes notifications to Discord channels, PagerDuty,
            email, and SMS. Teams can acknowledge, escalate, or resolve
            incidents directly from the alert interface.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>7. Versioning &amp; Release Notes:</strong> Semantic
            versioning is automated using custom scripts. Changelogs are
            generated from commit messages and published as GitHub Releases and
            internal documentation, ensuring traceability and auditability.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
