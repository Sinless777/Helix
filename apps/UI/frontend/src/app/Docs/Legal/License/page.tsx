'use client'

import { Box, Container, Typography } from '@mui/material'
import React from 'react'

export default function LicensePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight="bold">
        Helix AI Open Source License
      </Typography>

      <Typography variant="body1" paragraph>
        Copyright (c) 2020–Present SinLess Games LLC
      </Typography>

      <Typography variant="body1" paragraph>
        Permission is hereby granted, free of charge, to any individual or
        organization obtaining a copy of this software and associated
        documentation files (the &quot;Software&quot;), to use, copy, modify,
        merge, and run the Software{' '}
        <strong>
          solely for personal, non-commercial, academic, or research purposes
        </strong>
        , subject to the following conditions:
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        1. Attribution Required
      </Typography>
      <Typography variant="body1" paragraph>
        You must retain all copyright, attribution, and license notices in both
        source and binary forms of the Software. Any derivative works or
        publicly shared use must include:
      </Typography>
      <Box component="ul" pl={3}>
        <li>
          Clear attribution to <strong>Helix AI</strong>
        </li>
        <li>
          A link to the project site:{' '}
          <a
            href="https://helixaibot.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://helixaibot.com
          </a>
        </li>
        <li>A visible notice that modifications were made (if applicable)</li>
      </Box>

      <Typography variant="h5" gutterBottom mt={4}>
        2. Non-Commercial Use Only
      </Typography>
      <Typography variant="body1" paragraph>
        The Software may <strong>not</strong> be used, in whole or in part, for
        commercial purposes without prior written permission. This includes but
        is not limited to:
      </Typography>
      <Box component="ul" pl={3}>
        <li>Selling or reselling the Software or access to it</li>
        <li>
          Offering paid services that incorporate or depend on the Software
        </li>
        <li>Using the Software in commercial products or business workflows</li>
        <li>Offering the Software or derivatives as a SaaS platform</li>
      </Box>
      <Typography variant="body1" paragraph>
        To inquire about commercial licensing, contact:{' '}
        <strong>legal@helixaibot.com</strong>
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        3. No Resale, Rebranding, or Sublicensing
      </Typography>
      <Box component="ul" pl={3}>
        <li>You may not rebrand or rename the Software as your own</li>
        <li>
          You may not offer the Software under a different identity or trademark
        </li>
        <li>
          You may not sublicense, rent, lease, or sell the Software or
          derivative works
        </li>
      </Box>

      <Typography variant="h5" gutterBottom mt={4}>
        4. No Misrepresentation
      </Typography>
      <Box component="ul" pl={3}>
        <li>You must not misrepresent the origin of the Software</li>
        <li>
          You must not claim authorship or sole ownership over the Software or
          any modified version thereof
        </li>
        <li>
          You must not use the Software to falsely represent affiliation with
          SinLess Games LLC or Helix AI
        </li>
      </Box>

      <Typography variant="h5" gutterBottom mt={4}>
        5. No Malicious Use
      </Typography>
      <Box component="ul" pl={3}>
        <li>
          You must not use the Software to violate the law or third-party rights
        </li>
        <li>
          You must not use the Software to interfere with, disrupt, or damage
          other systems, services, or infrastructure
        </li>
        <li>
          You must not use the Software to harvest data or perform surveillance
          without consent
        </li>
      </Box>

      <Typography variant="h5" gutterBottom mt={4}>
        6. No Warranty
      </Typography>
      <Typography variant="body1" paragraph>
        THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
        KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
      </Typography>
      <Box component="ul" pl={3}>
        <li>MERCHANTABILITY</li>
        <li>FITNESS FOR A PARTICULAR PURPOSE</li>
        <li>NON-INFRINGEMENT</li>
      </Box>
      <Typography variant="body1" paragraph>
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGE, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT, OR OTHERWISE, ARISING FROM OR IN CONNECTION WITH THE SOFTWARE OR
        THE USE OF OR OTHER DEALINGS IN THE SOFTWARE.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        7. Compliance and Revocation
      </Typography>
      <Typography variant="body1" paragraph>
        Failure to comply with the terms of this license may result in{' '}
        <strong>immediate revocation</strong> of the rights granted herein.
        SinLess Games LLC reserves the right to pursue legal action for
        violations.
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        8. Commercial Use Exception
      </Typography>
      <Typography variant="body1" paragraph>
        If you would like to use this Software for commercial purposes, custom
        licensing may be available under separate terms. Please reach out to:
        <br />
        📧 <strong>legal@helixaibot.com</strong>
      </Typography>

      <Typography variant="h5" gutterBottom mt={4}>
        9. License Modifications
      </Typography>
      <Typography variant="body1" paragraph>
        This license may be updated or revised at any time. Continued use of the
        Software after such changes constitutes acceptance of the new terms. The
        most current version will always be available at:
        <br />
        <a
          href="https://github.com/SinLess-Games/Helix-AI"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/SinLess-Games/Helix-AI
        </a>
      </Typography>

      <Typography variant="caption" display="block" mt={6}>
        © 2025 SinLess Games LLC. All rights reserved.
      </Typography>
    </Container>
  )
}
