"use client";

import React from "react";
import { Box, Typography, Divider, Container } from "@mui/material";

export default function ProjectOverviewPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6, color: "#FFFFFF" }}>
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight={700}
          gutterBottom
          sx={{ color: "#FFFFFF" }}
        >
          Project Overview
        </Typography>
        <Divider
          sx={{ my: 3, borderColor: "#333", maxWidth: 300, mx: "auto" }}
        />
      </Box>

      <Typography
        variant="body1"
        sx={{ fontSize: "1.15rem", color: "#DDDDDD", mb: 2 }}
      >
        Helix AI is a next-generation, cloud-native AI companion designed to be
        more than just a tool—it’s a trusted partner in every interaction. By
        combining advanced natural language understanding (NLU), sentiment
        analysis, deep neural network (DNN) models, and machine learning (ML)
        techniques, Helix delivers highly personalized guidance tailored to each
        user’s unique preferences and workflows.
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontSize: "1.15rem", color: "#DDDDDD", mb: 2 }}
      >
        Whether providing step-by-step troubleshooting, summarizing
        cross-platform meeting notes, or proactively alerting on critical system
        events, Helix uses a hybrid inference model—leveraging a proprietary LLM
        alongside best-of-breed public models—to ensure accuracy, reliability,
        and responsiveness. Its adaptive learning engine continuously ingests
        telemetry, logs, and performance metrics to maintain an accurate model
        of the user’s environment, offering contextual suggestions that feel
        truly intuitive.
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ color: "#88CCFF", mt: 4 }}
      >
        Key Characteristics:
      </Typography>
      <Box component="ul" sx={{ pl: 4, color: "#CCCCCC" }}>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Unified Ecosystem</strong>: Bridges chat platforms (Discord,
          Slack), cloud services (AWS, GCP), version control (GitHub, GitLab),
          and more under a single conversational interface.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Multimodal Interaction</strong>: Supports seamless transitions
          between text, voice, and visual data—enabling voice commands,
          real-time transcription, and data-driven chart generation.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Context Preservation</strong>: Maintains session history,
          cross-channel context, and user intent, allowing Helix to pick up
          conversations exactly where they left off.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Proactive Assistance</strong>: Uses predictive analytics and
          pattern recognition to anticipate user needs—like recommending
          optimizations based on historical usage or flagging anomalies before
          they escalate.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Privacy & Security</strong>: Implements end-to-end encryption,
          role-based access control, and fine-grained data governance to ensure
          user data remains secure and compliant.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Extensible Plugin Architecture</strong>: Allows developers to
          add custom data connectors, workflows, and domain-specific skills,
          fostering a vibrant ecosystem of community-driven enhancements.
        </Typography>
      </Box>

      <Divider sx={{ my: 4, borderColor: "#444" }} />

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ color: "#88CCFF" }}
      >
        DevSecOps at Helix AI
      </Typography>
      <Typography variant="body1" sx={{ color: "#DDDDDD", mb: 2 }}>
        At Helix, security and compliance aren’t bolted on at the end—they’re
        woven into every step of our build, test, and deployment pipeline. By
        “shifting left,” we catch vulnerabilities early, enforce policy-as-code,
        and continuously validate that our infrastructure and applications meet
        our stringent standards.
      </Typography>

      <Box component="ul" sx={{ pl: 4, color: "#CCCCCC" }}>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Pre-commit Scans & Tests</strong>: ESLint, Prettier, SAST
          (e.g. SonarQube), dependency checks (OWASP, Snyk) and unit tests run
          automatically to block insecure or non-compliant code before it even
          lands in Git.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>CI Pipeline Security Gates</strong>: In Jenkins/GitLab CI we
          run container image scans, IaC linters (Terraform, Kubernetes policies
          via Kyverno/OPA), secret detection, and dynamic analysis to prevent
          risky changes from advancing.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Staging & Canary Hardening</strong>: Each deployment to
          staging and canary environments is subject to penetration tests,
          automated security smoke tests, and compliance validation—if any test
          fails, the release is automatically halted and rolled back.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Policy-as-Code Enforcement</strong>: Kubernetes RBAC, network
          policies, container runtime restrictions, and cloud IAM rules are
          defined declaratively and enforced via automated admission
          controllers, ensuring drift never compromises our zero-trust posture.
        </Typography>
        <Typography component="li" variant="body1">
          {" "}
          <strong>Continuous Monitoring & Alerts</strong>: Post-deployment,
          Prometheus/Alertmanager and Logstash/Loki pipelines watch for
          anomalies and policy violations in real-time, triggering notifications
          to appropriate on-call engineers (Discord, PagerDuty, Slack).
        </Typography>
      </Box>
    </Container>
  );
}
