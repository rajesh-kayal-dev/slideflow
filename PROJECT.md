# SlideFlow Project Documentation

This document provides a detailed overview of the technical architecture, technology stack, and internal workflows of SlideFlow.

---

## 🏗️ Internal Architecture & Workflow

SlideFlow operates as a **modern distributed system** where the user interface, backend logic, and AI engines work in synchronization via an event-driven model.

### 1. Presentation Initiation
*   **User Input**: The user provides a topic prompt and selects parameters (Tone, Style, Slide Count).
*   **Server Function**: A TanStack Start server function creates a record in the **PostgreSQL** database via **Prisma**.
*   **Event Trigger**: An **Inngest** event is dispatched (`presentation/generate`), immediately returning a "Processing" status to the user to keep the UI responsive.

### 2. AI Generation Pipeline (Background)
*   **Structured Prompting**: The Inngest worker pulls the prompt and calls **Google Gemini AI**.
*   **JSON Schema**: We use strict JSON output mode to ensure the AI returns a predictable structure (Title, Content, Image Keywords, Speaker Notes).
*   **Slide Persistence**: Once received, Prisma bulk-creates `Slide` records linked to the `Presentation`.

### 3. Real-time Synchronization
*   **Polling/Invalidation**: The frontend uses **TanStack Query** to monitor the presentation status.
*   **State Update**: Once the background job finishes, the UI automatically transitions from the "Generating" state to the "Editor" view.

### 4. Export & Delivery
*   **PPTX Mapping**: When a user clicks "Export," the system maps the database slide content to the **PptxGenJS** library, which constructs a valid XML-based `.pptx` file for the user to download.

---

## 🎨 Frontend Technology Stack

The frontend is designed for a **high-fidelity, premium SaaS experience** with a focus on performance and type-safety.

| Technology | Purpose |
| :--- | :--- |
| **React 19** | The core UI library for component-based architecture. |
| **TanStack Router** | Provides 100% type-safe routing and data pre-fetching. |
| **Tailwind CSS v4** | Utilized for the utility-first design system and glassmorphism effects. |
| **TanStack Query** | Manages server state, caching, and background synchronization. |
| **Lucide React** | A consistent, high-quality icon set for the entire platform. |
| **CSS Keyframes** | Custom-built floating and pulsing animations for the "Premium" feel. |
| **Radix UI** | Accessible primitive components for modals, selects, and dropdowns. |

---

## ⚙️ Backend Technology Stack

The backend is built using a **serverless-first** approach that scales horizontally.

| Technology | Purpose |
| :--- | :--- |
| **TanStack Start** | Full-stack framework handling SSR and secure Server Functions. |
| **Prisma ORM** | Type-safe database client for PostgreSQL operations. |
| **Google Gemini 1.5** | The AI engine responsible for content creation and structuring. |
| **Inngest** | An event-driven queue for handling long-running AI tasks reliably. |
| **Better Auth** | Manages Google/GitHub OAuth and secure session tokens. |
| **ImageKit** | Optimizes and serves AI-generated imagery for the slide decks. |
| **Nodemailer** | Handles professional email sharing and invitations via SMTP. |

---

## 🛠️ Security & Scaling

*   **OAuth 2.0**: All user data is protected via industrial-standard OAuth providers.
*   **Environment Validation**: Using `@t3-oss/env-core` to ensure the app never starts without required security keys.
*   **Edge Compatibility**: The backend is designed to run on Edge/Serverless environments for global low-latency.

---

<div align="center">
  <p><strong>SlideFlow AI - The Future of Presentations</strong></p>
</div>
