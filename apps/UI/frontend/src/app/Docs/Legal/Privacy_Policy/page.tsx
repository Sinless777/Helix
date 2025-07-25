'use client'

import { Box, Container, Typography } from '@mui/material'
import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight="bold">
        Privacy Policy
      </Typography>

      <Typography variant="body1" paragraph>
        Effective Date: July 1, 2025
      </Typography>

      <Typography variant="body1" paragraph>
        At SinLess Games LLC (&quot;we&quot;, &quot;our&quot;, or
        &quot;us&quot;), your privacy is our priority. This Privacy Policy
        outlines in clear terms how we collect, use, process, and protect your
        personal information when you interact with our digital services.
        Whether you&apos;re engaging with our products, using our AI features,
        or authenticating via third-party providers, we are committed to being
        transparent about how your data is handled. We believe that data privacy
        is a fundamental right, and our systems are designed with that principle
        at the core.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        1. Information We Collect
      </Typography>
      <Typography variant="body1" paragraph>
        We collect a variety of information to provide and improve our services,
        which includes:
      </Typography>
      <Box component="ul" pl={3}>
        <li>
          <strong>Usage Data:</strong> Including your interactions with our app,
          features accessed, buttons clicked, pages viewed, and session
          durations.
        </li>
        <li>
          <strong>Personal Identifiers:</strong> Such as your full name and
          billing address, primarily used for account management and payment
          processing.
        </li>
        <li>
          <strong>Third-Party Account Data:</strong> When you sign in using
          services like Google or Facebook, we may collect your email address,
          profile picture, display name, user ID, and any additional information
          made available via those platforms&apos; APIs.
        </li>
        <li>
          <strong>Technical Information:</strong> Including IP addresses,
          browser type, operating system, device identifiers, screen resolution,
          language preference, and geolocation data. This is primarily used for
          analytics, fraud prevention, and platform optimization.
        </li>
        <li>
          <strong>Cookies and Local Storage:</strong> We use these technologies
          to remember user preferences, enable secure sign-ins, and collect
          aggregate statistics about user behavior across our site.
        </li>
      </Box>
      <Typography variant="body1" paragraph>
        All collected information is handled in accordance with applicable
        privacy laws, including GDPR, CCPA/CPRA, and HIPAA where relevant.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        2. How We Use Your Data
      </Typography>
      <Typography variant="body1" paragraph>
        We use your data in several essential ways to ensure the best possible
        experience and functionality:
      </Typography>
      <Box component="ul" pl={3}>
        <li>
          <strong>AI Personalization:</strong> Your data helps us train and
          tailor AI models to respond accurately to your preferences, behaviors,
          and needs.
        </li>
        <li>
          <strong>Performance Enhancement:</strong> Analyzing user interaction
          allows us to identify bugs, optimize performance, and prioritize new
          features based on actual usage.
        </li>
        <li>
          <strong>Account Management:</strong> We use your credentials and
          billing information to facilitate secure login, authentication,
          subscription processing, and customer support.
        </li>
        <li>
          <strong>Fraud Prevention & Security:</strong> We monitor patterns, IP
          addresses, and device fingerprints to detect suspicious activity and
          protect the platform and its users from abuse.
        </li>
        <li>
          <strong>Legal Compliance:</strong> When required, we may process data
          to comply with applicable legal obligations or law enforcement
          requests.
        </li>
      </Box>
      <Typography variant="body1" paragraph>
        We never sell your data. We may share it only with tightly controlled
        service providers (e.g., AI model hosts) who are bound by data
        protection agreements to process your information solely on our behalf.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        3. Data Ownership
      </Typography>
      <Typography variant="body1" paragraph>
        You own your data. We treat all data you provide as your property and
        recognize your full rights to access, modify, and delete it at any time.
        Our role is limited to processing your information solely to deliver,
        enhance, and support your use of AI-powered features within our
        services. We do not monetize your data, nor do we sell or lease it to
        advertisers or third-party marketers. In all cases, your data remains
        under your control, and we are simply custodians operating under your
        direction and applicable privacy regulations.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        4. Retention
      </Typography>
      <Typography variant="body1" paragraph>
        User data is stored indefinitely unless you request deletion through
        your account settings or by contacting us directly. Once a request for
        deletion is verified, all associated personal data will be purged from
        our active systems and scheduled for erasure from backup archives within
        30 days. We may retain minimal data for legal compliance or dispute
        resolution purposes as permitted by law.
      </Typography>
      <Typography variant="body1" paragraph>
        IP addresses and device-related metadata are retained for up to 90 days
        for the purposes of fraud detection, abuse prevention, and platform
        security auditing. This retention is necessary to ensure platform
        integrity, enforce bans, and maintain secure environments for all users.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        5. User Rights
      </Typography>
      <Typography variant="body1" paragraph>
        If you are located in the EU, California, or are protected under U.S.
        healthcare regulations, you have specific legal rights under GDPR,
        CCPA/CPRA, and HIPAA. These include:
      </Typography>
      <Box component="ul" pl={3}>
        <li>
          <strong>Right to Access:</strong> You can request a copy of the
          personal or health-related data we hold about you.
        </li>
        <li>
          <strong>Right to Rectification:</strong> You may request correction of
          inaccurate or incomplete data.
        </li>
        <li>
          <strong>Right to Deletion:</strong> Also known as the “right to be
          forgotten,” you can request that we delete your personal or health
          information, subject to certain exceptions.
        </li>
        <li>
          <strong>Right to Object:</strong> You may object to certain types of
          data processing, such as direct marketing or profiling.
        </li>
        <li>
          <strong>Right to Restrict Processing:</strong> You can request that we
          limit the way we use your data while a complaint is being
          investigated.
        </li>
        <li>
          <strong>Right to Data Portability:</strong> You have the right to
          obtain your data in a structured, commonly used, and machine-readable
          format and to have that data transmitted to another controller where
          technically feasible.
        </li>
        <li>
          <strong>Right to Non-Discrimination:</strong> Under CCPA, you have the
          right not to receive discriminatory treatment for exercising any of
          your rights.
        </li>
      </Box>
      <Typography variant="body1" paragraph>
        To exercise any of these rights, please contact us at{' '}
        <strong>support@sinlessgamesllc.com</strong>. We may need to verify your
        identity before processing your request to ensure your data is
        protected.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        6. Cookies
      </Typography>
      <Typography variant="body1" paragraph>
        We use cookies and local storage to improve your browsing experience,
        maintain session persistence, support login functionality, and gather
        analytics to enhance platform performance. These small data files are
        stored on your device and may include both first-party cookies (from our
        site) and third-party cookies (e.g., from analytics tools or social
        login providers).
      </Typography>
      <Typography variant="body1" paragraph>
        You have the ability to accept or decline cookies through our cookie
        banner or your browser settings. Our cookie banner allows you to:
      </Typography>
      <Box component="ul" pl={3}>
        <li>Accept all cookies for full functionality and personalization</li>
        <li>Reject non-essential cookies (e.g., analytics or marketing)</li>
        <li>Customize cookie preferences by category</li>
      </Box>
      <Typography variant="body1" paragraph>
        Disabling certain cookies may affect your experience, such as preventing
        auto-login or disabling analytics that help us optimize features. We do
        not use cookies to collect sensitive information or share your activity
        with advertisers.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        7. Data Security
      </Typography>
      <Typography variant="body1" paragraph>
        We implement robust administrative, technical, and physical safeguards
        to protect your personal and health-related data against unauthorized
        access, disclosure, alteration, or destruction. These include:
      </Typography>
      <Box component="ul" pl={3}>
        <li>
          <strong>Encryption:</strong> All sensitive data in transit and at rest
          is encrypted using modern cryptographic standards (e.g., AES-256, TLS
          1.3).
        </li>
        <li>
          <strong>Access Controls:</strong> Role-based access policies ensure
          only authorized personnel can access personal data, with mandatory
          multi-factor authentication.
        </li>
        <li>
          <strong>Monitoring & Auditing:</strong> Continuous monitoring systems
          are in place to detect unauthorized activity, along with regular
          security audits and vulnerability scans.
        </li>
        <li>
          <strong>Compliance Frameworks:</strong> Our infrastructure aligns with
          HIPAA, SOC 2, and U.S. military-grade cybersecurity guidelines,
          including zero-trust network segmentation, secure enclave isolation,
          hardened containers for sensitive workloads, and compliance with NIST
          SP 800-53 and DISA STIG baselines.
        </li>
        <li>
          <strong>Incident Response:</strong> In the event of a security breach,
          we follow a tested incident response protocol, notify affected users
          as required by law, and coordinate with relevant authorities.
        </li>
      </Box>
      <Typography variant="body1" paragraph>
        Our commitment to security reflects the highest standards of
        defense-grade information protection. While no system is completely
        immune to threats, we continuously assess, test, and evolve our controls
        to uphold your trust.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        8. Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        If you have questions, concerns, or requests regarding your privacy or
        our data practices, we encourage you to reach out. We are committed to
        responding promptly and transparently.
        <br />
        <br />
        You can contact us at:
        <br />
        <strong>Email:</strong> support@sinlessgamesllc.com
        <br />
        <strong>Mailing Address:</strong> SinLess Games LLC, 1234 Privacy Way,
        Suite 500, Austin, TX 78701, USA
        <br />
        <br />
        If you are located in the EU, you may also contact our Data Protection
        Officer (DPO) at the same email above for GDPR-specific concerns. If you
        are a California resident and wish to exercise your CCPA rights, you may
        also use the above contact information to make requests.
      </Typography>

      <Typography variant="caption" display="block" mt={6}>
        © 2025 SinLess Games LLC. All rights reserved.
      </Typography>
    </Container>
  )
}
