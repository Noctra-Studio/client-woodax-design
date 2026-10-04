<!--
  COVER IMAGE PLACEHOLDER

  Add the final Woodax + CNC coming-soon preview here.
  Recommended size: 1600 × 900 px (16:9).

  Example:
  ![Woodax and CNC coming-soon experiences](./public/images/coming-soon-cover.jpg)
-->

# Woodax & CNC — Coming-Soon Experiences

Two focused, bilingual coming-soon pages designed to attract attention, qualify potential customers, and capture useful leads while the complete Woodax and CNC websites are being built.

These pages are intentionally not miniature landing pages. Each one presents a single idea, asks the visitor to make one meaningful choice, and turns that choice into the first step of a real project.

> **Scope:** The progressive form, micro-decisions, and qualification questions described below belong to the final websites, not to the current coming-soon pages. The coming-soon phase ships a single contact form. Pending work for the final websites is tracked in [`BACKLOG.md`](./BACKLOG.md).

## Project Goals

- Create interest without revealing the full future website.
- Capture contact information with as little friction as possible.
- Qualify leads through small, context-specific decisions.
- Give every visitor a clear and valuable next step.
- Provide complete Spanish and English experiences.
- Preserve a distinct personality for Woodax and CNC instead of reusing the same page with different branding.

## Shared Experience Principles

Both pages follow the same conversion sequence:

**Curiosity → Micro-decision → Contact details → Relevant next step**

The experience should fit within a single viewport whenever possible and include:

- One central message.
- One memorable visual interaction.
- One primary call to action.
- A progressive form with no more than three or four visible fields at a time.
- A discreet `ES / EN` language selector.
- Only essential secondary links, such as privacy information.

The pages should not include a full navigation menu, service lists, testimonials, FAQs, long company descriptions, or generic newsletter messaging.

## Woodax

### Concept: The Beginning of a Bespoke Piece

Woodax is an aspirational, high-value experience. Its coming-soon page should feel like entering a quiet design studio rather than visiting a construction notice.

The visual direction is editorial, tactile, and refined: warm wood tones, stone, soft neutral colors, controlled lighting, generous negative space, and detailed material photography. A subtle interaction may reveal the wood grain, change the light across a surface, or transform the composition as the visitor selects a project type.

### Primary Interaction

The visitor begins by answering:

> What would you like to transform?

Suggested options:

- Kitchen
- Closet
- Custom piece
- Commercial space

This choice provides useful context before any personal information is requested. The form then asks for:

- Name
- WhatsApp number or email address
- City

Optional qualification questions may appear after the initial submission:

- Project stage: idea, measurements available, or ready to quote.
- Preferred start date: now, within one to three months, or later.

### Value Exchange

Woodax should not ask visitors to simply “join a mailing list.” The visitor is requesting early portfolio access and guidance on the best way to begin a custom project.

Suggested primary call to action:

> Explore my project

### Intended Lead Profile

Homeowners, architects, interior designers, and businesses looking for custom furniture or made-to-measure spatial solutions.

## CNC

### Concept: Your Project Has Already Started

CNC should communicate precision, feasibility, and production readiness. The experience can resemble a digital workbench where technical lines, coordinates, dimensions, and toolpaths respond to the visitor's selections.

The visual direction is industrial and kinetic: a dark or technical neutral background, fine measurement lines, restrained machine-like motion, and a focused accent color such as safety orange, electric green, or technical blue.

### Primary Interaction

The visitor first identifies the material:

- Wood (MDF, plywood, solid wood)
- Acrylic
- Thin aluminum

The next micro-decision determines the state of the project:

- File ready for production
- Assistance required
- Early-stage idea

The initial form then asks for:

- Name
- WhatsApp number or email address

After submission, the visitor may optionally:

- Upload a production file.
- Add dimensions and quantities.
- Indicate the required completion date.
- Continue the conversation through WhatsApp.

File upload should not be required during the first step. Visitors who only have an idea should still be able to become qualified leads.

### Value Exchange

The visitor is not subscribing for updates. They are requesting an initial project review and guidance about production feasibility.

Suggested primary call to action:

> Request a project review

### Intended Lead Profile

Designers, workshops, manufacturers, architects, makers, and businesses that need accurate CNC production or support preparing a project for fabrication.

## Bilingual Experience

Both pages must provide complete Spanish and English versions.

Recommended localized routes:

- `/es/woodax`
- `/en/woodax`
- `/es/cnc`
- `/en/cnc`

The experience should:

- Detect the browser language only on the first visit.
- Allow the visitor to change language at any time.
- Remember the selected language.
- Preserve form answers when the language changes.
- Translate validation, confirmation, privacy, and error messages.
- Store the visitor's preferred language with the lead.
- Send confirmations and follow-up messages in that same language.

English copy should be adapted for natural tone and intent rather than translated word for word from Spanish.

## Lead Data and Attribution

Each submission should record the contact information together with the context created during the interaction.

Recommended fields:

- Lead source: `coming-soon-woodax` or `coming-soon-cnc`
- Preferred language: `es` or `en`
- Selected project or material type
- Project stage or file readiness
- City, when relevant
- Desired timeline
- Campaign and traffic attribution
- Contact consent

This information makes it possible to separate casual interest from future opportunities and prospects who are ready to discuss a quote.

## Confirmation Experience

The success state should feel like a continuation of the experience, not a generic “form submitted” message.

For Woodax, the next step may be early portfolio access, a private consultation, or a request for basic measurements and inspiration.

For CNC, the next step may be an optional file upload, a short technical brief, or a direct WhatsApp conversation about dimensions and quantities.

Any stated response time must reflect the team's actual availability.

## Success Metrics

The pages should be evaluated through a small set of meaningful events:

- Interaction start rate
- Form start rate
- Form completion rate
- Qualified lead rate
- WhatsApp continuation rate
- Optional detail or file submission rate
- Conversion rate by language and traffic source

The priority is not collecting the largest possible number of email addresses. It is creating enough trust and context to begin useful conversations with potential customers before the final websites launch.

## Technology

The project is built with Next.js, React, TypeScript, Tailwind CSS v4, next-intl, motion, Resend + React Email, zod, and Vercel.

The bilingual coming-soon pages should reuse the existing localization and lead-management infrastructure while keeping the two visual experiences independent.
