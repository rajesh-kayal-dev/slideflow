# SlideFlow Backend & Server Architecture

The backend of **SlideFlow** is built using a modern, high-performance "Full-Stack TypeScript" architecture. This document provides a detailed breakdown of the core technologies that power our server-side engine.

---

## 🚀 Core Technologies

### 1. Framework: TanStack Start
*   **What it is**: A next-generation full-stack framework (built on TanStack Router).
*   **Role**: It handles the entire server-side lifecycle, including **Server-Side Rendering (SSR)** and **Server Functions**. This allows the app to perform secure database operations directly from the UI without needing a separate REST API.

### 2. Database & ORM: Prisma + PostgreSQL
*   **Database**: A **PostgreSQL** database stores your users, presentations, and individual slides.
*   **ORM (Prisma)**: We use **Prisma 7** to interact with the database. It provides type-safety, meaning if I change the database schema, the TypeScript code automatically knows about it, preventing bugs.

### 3. AI Engine: Vercel AI SDK + Google Gemini
*   **Vercel AI SDK**: Provides the logic for streaming and managing AI responses.
*   **Google Gemini**: The "brain" of the app. It uses the **Gemini 2.5 Flash** or Pro models to take a user's prompt and turn it into a structured JSON object containing slide titles, content, and image descriptions.

### 4. Background Processing: Inngest
*   **Why it's used**: Generating a full presentation (with multiple slides and images) can take 20–30 seconds. If we did this in a standard request, the browser might timeout.
*   **Role**: **Inngest** handles this as a "background job." When you click "Create," the server sends a signal to Inngest to handle the heavy lifting, allowing the user to keep using the app while the slides are being built.

### 5. Authentication: Better Auth
*   **Role**: A highly secure authentication framework that manages **Google and GitHub OAuth**. It handles sessions, security tokens, and user profiles, storing everything safely in your PostgreSQL database.

### 6. Media Management: ImageKit
*   **Role**: All slide images are processed and optimized via **ImageKit**. It ensures that the high-resolution AI-generated images load instantly on any device by automatically resizing and compressing them.

### 7. Exports: PptxGenJS
*   **Role**: A specialized library that takes the slide data from the database and reconstructs it into a native **.pptx** file structure, allowing you to download your AI-created slides and open them directly in Microsoft PowerPoint.

---

## 📊 Summary Table

| Area | Technology |
| :--- | :--- |
| **Core Runtime** | Node.js (via TanStack Start) |
| **Language** | TypeScript (Strict Mode) |
| **Persistence** | PostgreSQL + Prisma ORM |
| **Intelligence** | Google Gemini 2.5 Flash |
| **Async Flow** | Inngest (Event-driven) |
| **Security** | Better Auth (OAuth 2.0) |
| **Communication** | Nodemailer (SMTP) |

---

<div align="center">
  <p><strong>SlideFlow AI - Powered by Modern TypeScript</strong></p>
</div>
