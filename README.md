<div align="center">
  <img src="./public/SlideFlowLogo.png" alt="SlideFlow Logo" width="120" />
  <h1>SlideFlow AI</h1>
  <p><strong>Transform your ideas into stunning presentations with the power of AI.</strong></p>

  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  </div>
</div>

---

## 🚀 Overview

**SlideFlow AI** is a premium, full-stack AI-powered presentation engine. It allows users to generate high-fidelity slide decks from simple text prompts or structured notes. With a focus on speed, aesthetics, and ease of use, SlideFlow handles everything from content structuring to image generation and final export.

### ✨ Key Features

- 🧠 **AI-Powered Generation** – Describe your topic and let Gemini AI draft your slides in seconds.
- 🎨 **Premium Visuals** – Dynamic background animations, glassmorphism UI, and smooth scroll reveals.
- ✍️ **Interactive Editor** – Real-time slide editing, content regeneration, and layout adjustment.
- 🎬 **Present & Preview** – Full-screen slideshow mode with professional transitions.
- 📥 **Native Export** – Download your creations as fully editable `.pptx` files.
- 🔒 **Secure Auth** – Seamless login with Google or GitHub via Better Auth.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Animations |
| **Database** | [Prisma 7](https://www.prisma.io/) + PostgreSQL |
| **Authentication** | [Better Auth](https://www.better-auth.com/) |
| **AI Engine** | [Vercel AI SDK](https://ai-sdk.dev/) + Google Gemini |
| **Background Jobs** | [Inngest](https://www.inngest.com/) |
| **Images** | [ImageKit](https://imagekit.io/) |
| **Export** | [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) |

---

## 📦 Getting Started

### Prerequisites

- Node.js (LTS)
- pnpm (Recommended)
- PostgreSQL Database
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/slideflow.git
   cd slideflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="your-postgresql-url"
   BETTER_AUTH_SECRET="your-auth-secret"
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
   IMAGEKIT_PUBLIC_KEY="your-public-key"
   IMAGEKIT_PRIVATE_KEY="your-private-key"
   IMAGEKIT_BASE_URL="your-base-url"
   ```

4. **Initialize Database**
   ```bash
   pnpm db:push
   pnpm db:generate
   ```

5. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the magic!

---

## 🏗️ Project Structure

```text
src/
  routes/                 # File-based routing & API endpoints
  features/presentations/ # Presentation logic & state management
  components/             # Premium UI components & landing page
  integrations/           # Inngest, AI, and third-party services
  lib/                    # Utilities, Auth, and helper functions
prisma/                   # Database schema and seed data
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by the SlideFlow Team</p>
</div>
