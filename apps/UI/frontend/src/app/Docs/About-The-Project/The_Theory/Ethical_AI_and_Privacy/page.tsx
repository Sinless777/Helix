'use client'

import { Box, Typography, Divider, Link } from '@mui/material'

export default function EthicalAIAndPrivacyPage() {
  return (
    <Box component="main" sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
      <Typography
        variant="h2"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
        sx={{ color: 'primary.main' }}
      >
        Ethical AI and Privacy in Helix
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        Addressing Public Concerns
      </Typography>
      <Typography paragraph>
        AI has often been portrayed in media and film as a
        threat—uncontrollable, invasive, and coldly rational. These portrayals
        raise legitimate questions around safety, bias, manipulation, and loss
        of control. As developers of Helix AI, we have taken these concerns
        seriously and designed Helix with the opposite values: empathy,
        transparency, and user empowerment.
      </Typography>
      <Typography paragraph>
        We understand that users want systems they can trust—systems that
        explain themselves, respect their boundaries, and work in alignment with
        their goals. Helix is engineered with built-in ethical constraints,
        consent-first behaviors, and human oversight mechanisms. We don&apos;t
        just prevent harmful outcomes; we actively design for beneficial impact.
      </Typography>
      <Typography paragraph>
        From data privacy to emotional sensitivity, Helix prioritizes human
        agency. Features like the Ethics Center, granular memory controls,
        explainable nudges, and opt-in integrations ensure that users remain in
        full control. The architecture is built with failsafes, encrypted audit
        trails, and real-time transparency tools to ensure nothing happens in
        the dark.
      </Typography>
      <Typography paragraph>
        By directly addressing the fears popularized in fiction—and seen in
        real-world AI failures—we position Helix as a new model for responsible
        AI: one that earns user trust by design, and reinforces it through
        consistent, respectful behavior.
      </Typography>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        The Ethics Center
      </Typography>
      <Typography paragraph>
        Helix includes a user-visible Ethics Center—a centralized, interactive
        space where users can explore, configure, and audit all aspects of
        Helix’s behavior. It is designed to be intuitive and transparent,
        empowering users to make informed choices and set boundaries that align
        with their personal values, workflows, and comfort levels.
      </Typography>
      <Typography paragraph>Within the Ethics Center, users can:</Typography>
      <ul>
        <li>
          Manage consent for data usage, integration access, and AI
          decision-making
        </li>
        <li>
          View the Transparency Log to inspect what the AI did, when, and why
        </li>
        <li>
          Explore the Audit Trail for every decision, output, and accessed
          resource
        </li>
        <li>
          Adjust Nudging Preferences for productivity, health, social behavior,
          and more
        </li>
        <li>
          Access a granular Memory Panel to view, encrypt, delete, or share
          specific items
        </li>
      </ul>
      <Typography paragraph>
        Each feature in the Ethics Center includes in-context explanations,
        metadata visibility (e.g., model version, confidence scores), and
        adjustable policies. The Center also allows users to export reports,
        flag unusual behavior, and invoke safety reviews if needed. These layers
        ensure Helix not only respects ethical boundaries—but does so visibly
        and accountably.
      </Typography>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        Memory and Transparency
      </Typography>
      <Typography paragraph>
        Helix gives users full visibility and control over how memory is
        captured, used, and retained. Each interaction—whether a prompt,
        command, or passive context—is stored as a structured memory object.
        These objects include rich metadata such as timestamps, model version,
        source classification (e.g., conversation, automation, API response),
        and confidence scores. This allows users to trace how Helix arrived at a
        conclusion or suggestion with clarity and accountability.
      </Typography>
      <Typography paragraph>
        Memory entries can be managed in real time. From the Memory Panel, users
        can view detailed entries, encrypt or redact specific lines, tag
        memories for quick access, or pause memory collection altogether.
        Privacy levels can be customized per entry—public, private, or
        ephemeral—with corresponding permissions and auto-expiration settings.
      </Typography>
      <Typography paragraph>
        For convenience and continuity, Helix supports the generation of memory
        cards—high-level summaries that group related activity into meaningful
        narratives. These can be automatically compiled by Helix (e.g., after
        meetings or decision-making sessions), or manually curated by users.
        Each card includes timelines, decisions made, linked files or commands,
        and any related user annotations.
      </Typography>
      <Typography paragraph>
        Memory cards improve long-term continuity across sessions, devices, and
        even collaborators. A developer returning to a project after a break
        might instantly review past logic decisions, while a team member can
        audit shared memory with permission-based access. All memory artifacts
        are versioned, traceable, and exportable in human-readable or
        machine-readable formats.
      </Typography>
      <Typography paragraph>
        By default, memory is retained indefinitely under user control. However,
        if no interaction is recorded for a 6-month period, Helix automatically
        initiates a secure purge of personal memory objects. This process
        includes cryptographic wiping, followed by a final summary notification.
        Users can change this threshold or disable auto-purging entirely in
        settings.
      </Typography>
      <Typography paragraph>
        Transparency is built into every memory event: Helix logs every
        read/write action, who initiated it, and why. These audit trails are
        encrypted and accessible through the Ethics Center, where users can
        filter by date, interaction type, or system activity. This commitment to
        traceability ensures that memory is not only useful, but trustworthy and
        accountable.
      </Typography>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        Sensitive Data and Encryption
      </Typography>
      <Typography paragraph>
        Helix supports integrations with highly sensitive data types such as
        biometrics (e.g., heart rate, sleep patterns), financial accounts (e.g.,
        spending history, budgeting tools), and identity-linked metadata (e.g.,
        location traces, contacts, and habits). Recognizing the critical nature
        of this data, Helix uses a comprehensive security strategy centered
        around end-to-end encryption, network isolation, and layered access
        controls.
      </Typography>
      <Typography paragraph>
        All communication is encrypted in transit using secure protocols such as
        TLS 1.3 and TLS 1.2 with{' '}
        <Link
          href="https://en.wikipedia.org/wiki/Forward_secrecy"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          Perfect Forward Secrecy (PFS)
        </Link>
        . Data at rest is safeguarded using{' '}
        <Link
          href="https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38e.pdf"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          XTS-AES-256
        </Link>{' '}
        with hardware-accelerated encryption through FIPS 140-2 validated
        hardware security modules (HSMs). This cipher is chosen for its
        resistance to block-level tampering and is considered among the
        strongest symmetric encryption standards in active deployment.
      </Typography>
      <Typography paragraph>
        Key management practices include automated key rotation, one-time-use
        key envelopes, and access scoping at the hardware interface level.
        Helix&apos;s approach ensures encryption keys are never exposed in plaintext
        to any application-layer logic, minimizing the attack surface.
      </Typography>
      <Typography paragraph>
        Helix employs a zero-trust architecture with{' '}
        <Link
          href="https://www.paloaltonetworks.com/cyberpedia/what-is-microsegmentation"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          microsegmentation
        </Link>
        ,{' '}
        <Link
          href="https://www.cloudflare.com/learning/network-layer/what-is-subnetting/"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          subnet isolation
        </Link>
        , and context-aware policy enforcement. Each service operates with the
        least privileges required, using granular role-based access control
        (RBAC) to ensure compartmentalization and accountability.
      </Typography>
      <Typography paragraph>
        Credential management and secret distribution is handled via HashiCorp
        Vault, integrated with anomaly detection systems like CrowdSec. When
        suspicious behavior is detected, Helix automatically revokes
        credentials, rotates keys, and isolates affected systems. Every
        interaction with sensitive data is logged and traced in real-time,
        creating a detailed and immutable audit trail. These logs are
        cryptographically sealed and reviewed regularly, enabling full lifecycle
        traceability and operational accountability.
      </Typography>
      <Typography paragraph>
        Finally, Helix supports zero-knowledge processing where possible,
        minimizing the exposure of plaintext data. Encryption-aware computation
        takes place in secure enclaves isolated from the main runtime, ensuring
        that decryption only occurs within trusted, ephemeral contexts when
        absolutely necessary.
      </Typography>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        Empathy and Safety
      </Typography>
      <Typography paragraph>
        Helix&apos;s empathy engine is designed to be respectful, not invasive.
        It uses a blend of real-time sentiment analysis, contextual language
        understanding, behavioral signals (such as typing cadence or speech
        tempo), and past interaction patterns to infer emotional tone. Users can
        fully configure the engine&apos;s sensitivity—from quiet acknowledgment
        to emotionally supportive dialogue—or opt out entirely for a more
        neutral experience.
      </Typography>
      <Typography paragraph>
        Emotional awareness is treated with high precision. During moments
        involving grief, anxiety, crisis language, or sarcasm, Helix activates
        internal safeguards. These include contextual pause-and-confirm
        sequences, suggestive prompts (e.g., &quot;Would you like to talk to
        someone?&quot;), and adaptive tone modulation. If patterns indicate
        sustained distress, Helix can escalate to show non-intrusive resources,
        such as mental health hotlines or in-app journaling tools—always
        respecting consent and privacy settings.
      </Typography>
      <Typography paragraph>
        Users can assign different empathy levels across modes and channels. For
        instance, one may prefer a clinical tone via email but a compassionate
        presence in voice interactions. All empathy settings are adjustable in
        the Ethics Center and can be tuned by time of day, platform, or detected
        activity (e.g., during a retrospective, Helix may reduce affective
        engagement to avoid bias).
      </Typography>
      <Typography paragraph>
        Empathy-aware memory is strictly opt-in. When enabled, Helix can
        remember and reference emotional context to improve continuity—for
        example, recognizing ongoing burnout and gently recommending time off or
        digital detox. Emotional tags are visible, editable, and fully deletable
        by the user at any time. Helix never stores affective metadata without
        explicit permission and will notify users if emotional logging is
        active.
      </Typography>
      <Typography paragraph>
        Harmful, manipulative, or emotionally coercive behavior is categorically
        disallowed. Helix does not simulate emotion for the purpose of
        persuasion, conversion, or influence. Empathy features are grounded in
        utility and respect—not emotional mimicry. Hallucinated content and
        experimental responses are restricted unless a user has explicitly
        enabled them in safe-mode. Even then, all uncertain or probabilistic
        output is labeled with clarity and confidence scores, and Helix avoids
        emotionally suggestive phrasing unless directed otherwise.
      </Typography>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        Nudging and Justification
      </Typography>
      <Typography paragraph>
        Helix provides gentle, context-aware nudges to assist users in achieving
        their self-defined goals—such as improving focus, maintaining wellness
        routines, reducing digital fatigue, or optimizing workflows. These
        nudges are not arbitrary or hidden; they are always initiated in
        alignment with user-defined preferences and governed by strict
        transparency requirements.
      </Typography>
      <Typography paragraph>
        Each nudge is accompanied by a clear and concise explanation of its
        origin. For example, a nudge might read,
        <em>
          “Because you stayed up late last night and have an early meeting,
          consider shortening screen time tonight.”
        </em>
        This helps users understand the rationale behind the system&apos;s
        prompt and reinforces trust in Helix&apos;s decision-making process.
      </Typography>
      <Typography paragraph>
        Nudges can be fine-tuned or disabled entirely through the Nudging
        Preferences panel in the Ethics Center. Users can manage nudging
        sensitivity by domain—such as health, focus, scheduling, collaboration,
        or energy conservation—and apply rules based on time of day, context, or
        device type. For example, users may allow wellness nudges on mobile but
        disable productivity nudges during weekends.
      </Typography>
      <Typography paragraph>
        In addition to real-time decision support, Helix tracks the
        effectiveness of nudges through feedback loops. Users may rate, ignore,
        dismiss, or accept each suggestion, and Helix adapts
        accordingly—lowering the frequency of unwanted prompts while improving
        timing and tone. A built-in “Why did I get this?” option is available on
        every nudge to provide detailed origin context.
      </Typography>
      <Typography paragraph>
        All nudging behavior is logged and auditable. Users can review nudge
        history sorted by time, impact, or category, and see what triggered each
        suggestion. If a pattern becomes repetitive or misaligned, it can be
        flagged for review or paused indefinitely.
      </Typography>
      <Typography paragraph>
        By making nudging fully explainable and reversible, Helix ensures that
        users remain in control of their attention and choices. Nudges are never
        used to manipulate, monetize, or track behavior outside the user&apos;s
        visible scope of consent. At all times, the user—not the AI—defines the
        objective, the boundaries, and the tone of assistance.
      </Typography>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        Output, Labeling, and Data Integrity
      </Typography>
      <Typography paragraph>
        Every piece of content generated by Helix—whether text, code, image, or
        summary—is explicitly labeled as AI-generated. Visual content includes
        embedded metadata (e.g., EXIF or IPTC tags) noting the generation model,
        timestamp, and the origin of the request. Text-based outputs display
        visual markers or footers indicating that the content originated from
        the Helix system, along with an optional “Why did I get this?” explainer
        that links to model details and decision context.
      </Typography>
      <Typography paragraph>
        Helix never generates content for others (e.g., replies, documents, or
        designs) without clear, active instruction from the user. This ensures
        that ownership, intent, and accountability are always user-led. Users
        must opt-in to every generation event, whether through voice, chat, or
        button interaction. All generated content is cryptographically linked to
        its generation session, including model version, input source, and
        confidence range.
      </Typography>
      <Typography paragraph>
        To maintain transparency, Helix preserves a complete provenance chain
        for every output—tracking who initiated it, how it was shaped, what
        source data it included, and what systems were involved. Helix embeds
        the full execution path of services that each object travels through
        directly into the object&apos;s metadata. This includes upstream API calls,
        transformer checkpoints, orchestration logic, and any post-processing
        applied. Users can audit this service graph in real-time via the Ethics
        Center or inspect metadata from the output context menu.
      </Typography>
      <Typography paragraph>
        For safety, Helix performs post-generation integrity checks to ensure
        that no sensitive data, hallucinated references, or misleading formats
        are present. In high-risk domains (e.g., legal, financial, health),
        Helix enforces additional validations and may require user confirmation
        before sharing or exporting results.
      </Typography>
      <Typography paragraph>
        Filtering and intelligent search tools allow users to explore only the
        kinds of interactions they want to review. For example, a developer
        might choose to view only past code completions, while a project manager
        may review only summary outputs from meetings. Users can filter by
        modality (text, visual, voice), topic, date range, sensitivity level, or
        model type.
      </Typography>
      <Typography paragraph>
        By enforcing robust labeling, traceability, and access filters, Helix
        ensures that generated content remains transparent, trustworthy, and
        attributable—eliminating ambiguity and upholding the user&apos;s right
        to understand and control what the system produces.
      </Typography>
    </Box>
  )
}
