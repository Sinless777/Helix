# email

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test email` to execute the unit tests via [Jest](https://jestjs.io).

```bash
libs/email/
└── src/
    ├── index.ts                           # Barrel: export module, service, types
    └── lib/
        ├── email.module.ts                # Nest module: wires config + providers
        ├── email.service.ts               # High-level API: send templated/plain mail
        │
        ├── config/
        │   └── email.config.ts            # Zod/Nest config (SMTP host/port, from, etc.)
        │
        ├── providers/
        │   ├── transport.factory.ts       # Creates Nodemailer (SMTP/Mailpit) or adapter
        │   └── template.engine.ts         # Simple renderer (e.g., Nunjucks/Handlebars)
        │
        ├── templates/
        │   ├── layouts/
        │   │   └── base.html              # Base layout (header/footer slots)
        │   ├── partials/
        │   │   ├── header.html
        │   │   └── footer.html
        │   └── emails/
        │       ├── verify-email.html
        │       ├── password-reset.html
        │       ├── magic-login.html
        │       └── mfa-code.html
        │
        ├── utils/
        │   ├── address.util.ts            # Parse/normalize "Name <email@x>" addresses
        │   └── render.util.ts             # Helper to pick template + inject vars
        │
        ├── types/
        │   └── email.types.ts             # Address, TemplateName, MailOptions, Result
        │
        └── dtos/
            └── send-mail.dto.ts           # DTO for controllers/queues to trigger mail

```
