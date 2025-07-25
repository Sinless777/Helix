'use client'

import { Box, Container, Typography } from '@mui/material'
import React from 'react'

export default function TermsOfServicePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight="bold">
        Terms of Service
      </Typography>

      <Typography variant="body1" paragraph>
        Effective Date: July 1, 2025
      </Typography>

      <Typography variant="body1" paragraph>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of the digital products and services offered by SinLess Games LLC
        (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By accessing or
        using our platform, you agree to be bound by these Terms. If you do not
        agree, please do not use our services.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        1. Account Registration
      </Typography>
      <Typography variant="body1" paragraph>
        To access certain features, you must create an account using valid
        credentials. You are responsible for maintaining the confidentiality of
        your login credentials and for all activities that occur under your
        account.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        2. Acceptable Use
      </Typography>
      <Typography variant="body1" paragraph>
        You agree not to:
      </Typography>
      <Box component="ul" pl={3}>
        <li>Use the platform for illegal or unauthorized purposes.</li>
        <li>
          Attempt to reverse engineer or extract source code from our services.
        </li>
        <li>Upload or share malicious software, spam, or offensive content.</li>
        <li>
          Interfere with other users’ experience or the platform’s operation.
        </li>
      </Box>

      <Typography variant="h5" gutterBottom mt={4}>
        3. Intellectual Property
      </Typography>
      <Typography variant="body1" paragraph>
        All content, trademarks, and software provided on the platform are owned
        by or licensed to SinLess Games LLC. You may not use, copy, or
        distribute them without our express written permission.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        4. Termination
      </Typography>
      <Typography variant="body1" paragraph>
        We may suspend or terminate your access to the platform at any time for
        violation of these Terms or for any other reason deemed necessary to
        protect our users or services.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        5. Disclaimers
      </Typography>
      <Typography variant="body1" paragraph>
        Our services are provided “as is” without warranties of any kind. We do
        not guarantee uninterrupted access, error-free performance, or that the
        platform will meet your expectations.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        6. Limitation of Liability
      </Typography>
      <Typography variant="body1" paragraph>
        To the fullest extent permitted by law, SinLess Games LLC shall not be
        liable for any indirect, incidental, or consequential damages arising
        out of your use of the platform.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        7. Changes to Terms
      </Typography>
      <Typography variant="body1" paragraph>
        We may update these Terms from time to time. Continued use of the
        platform after changes are posted constitutes your acceptance of the
        revised Terms.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        8. Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        If you have any questions or concerns about these Terms, you can reach
        us at:
        <br />
        <br />
        <strong>Email:</strong> support@sinlessgamesllc.com
        <br />
        <strong>Mailing Address:</strong> SinLess Games LLC, 1234 Privacy Way,
        Suite 500, Austin, TX 78701, USA
      </Typography>

      <Typography variant="caption" display="block" mt={6}>
        © 2025 SinLess Games LLC. All rights reserved.
      </Typography>
    </Container>
  )
}
