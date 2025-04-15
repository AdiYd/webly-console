# 🚀 AI Agent Playground - Next.js Boilerplate

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![daisyUI](https://img.shields.io/badge/daisyUI-5+-lightgrey?logo=daisyui&logoColor=black)](https://daisyui.com/) [![Firebase](https://img.shields.io/badge/Firebase-SDK_v10+-orange?logo=firebase&logoColor=white)](https://firebase.google.com/) [![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-3+-black?logo=vercel&logoColor=white)](https://sdk.vercel.ai/) [![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5+-blue?logo=nextdotjs&logoColor=white)](https://next-auth.js.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive boilerplate for building and experimenting with cross-platform AI agents. Built with Next.js, TypeScript, Tailwind CSS, daisyUI, Firebase, Vercel AI SDK, and NextAuth.js, this project provides a robust foundation for developing AI-powered applications and simulators with a focus on professional UI/UX.

---

## ✨ Features

*   **🤖 Cross-Platform AI Agent Interface**: Interactive chat widget powered by the Vercel AI SDK, supporting multiple AI providers (OpenAI, Anthropic, Gemini, Groq, etc.).
*   **🔥 Firebase Integration**: Seamless integration with Firebase services:
    *   **Authentication**: Secure user login and management.
    *   **Firestore**: NoSQL database for application data persistence.
    *   **Storage**: Cloud storage for file uploads (e.g., chat attachments).
*   **🛡️ Authentication**: Robust authentication flow using NextAuth.js, integrated with Firebase Auth and supporting various providers (Credentials, Google).
*   **🎨 Modern UI/UX**: Clean, professional, and responsive user interface built with Tailwind CSS and daisyUI components, emphasizing best practices for user experience. Includes theme switching (light/dark modes).
*   **⚙️ Unified AI Service Layer**: Abstracted API layer to interact with different AI models consistently.
*   **🔧 Environment Configuration**: Secure and organized setup for environment variables.
*   **📐 TypeScript**: Strong typing for enhanced code quality and maintainability.
*   **🚀 Next.js App Router**: Leverages the latest Next.js features for optimal performance and developer experience.

---

## 🏗️ Project Structure

```plaintext
webly-console/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── api/            # Backend API endpoints (e.g., /api/ai/chat)
│   │   │   └── ai/         # AI service endpoints
│   │   │   └── [...nextauth]/ # NextAuth.js authentication endpoints
│   │   ├── (auth)/         # Authentication pages (signin, signup)
│   │   ├── (main)/         # Main application pages (layout, dashboard, etc.)
│   │   │   ├── chat/       # AI Chat feature page
│   │   │   ├── exercises/  # Example feature page (Math Exercises)
│   │   │   └── profile/    # User profile page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable React components
│   │   ├── ai/             # AI-specific components (e.g., ChatInterface)
│   │   ├── layout/         # Layout components (Header, Footer, Navigation)
│   │   └── ui/             # General UI components (buttons, theme toggle, etc.)
│   ├── context/            # React Context providers (e.g., AIContext)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and services
│   │   ├── ai/             # AI service implementation (config, service)
│   │   └── firebase/       # Firebase configuration and client setup
│   ├── styles/             # Global styles (globals.css)
│   └── auth.ts             # NextAuth.js configuration
├── .env.local.example      # Example environment variables file
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS & daisyUI configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AdiYd/webly-console.git
    cd webly-console
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.local.example .env.local
        ```
    *   Fill in the required values in `.env.local`. See the comments within the file for details on each variable. You'll need credentials for:
        *   Firebase (Client SDK & Admin SDK)
        *   AI Providers (OpenAI, Anthropic, Gemini, Groq, etc.)
        *   NextAuth.js (Google Provider, Secret)

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 💡 Key Concepts

*   **AI Service Layer (`src/lib/ai/`)**: Provides a unified interface (`generateText`, `streamText`, etc.) to interact with various AI models. Configuration (`config.ts`) defines available providers and models, while `service.ts` handles the actual API calls. The `/api/ai/chat` endpoint uses this service.
*   **Firebase Integration (`src/lib/firebase/`)**: Initializes Firebase client and admin SDKs. Used for authentication state persistence, user data storage (Firestore), and potentially file uploads (Storage).
*   **Authentication (`src/auth.ts`)**: Configures NextAuth.js, defining providers (Credentials, Google), session strategy (JWT), and callbacks to integrate with Firebase Auth and manage user session data (including roles, custom expiry based on "Remember Me").
*   **UI/UX (`tailwind.config.ts`, `src/app/globals.css`, `src/components/ui/`)**: Utilizes Tailwind CSS utility classes and daisyUI components for rapid, consistent, and themeable UI development. `ThemeProvider` manages light/dark modes. Custom components ensure a professional look and feel.
*   **State Management (`src/context/AIContext.tsx`)**: Uses React Context to manage global AI settings like the selected provider, model, temperature, and system prompt, making them accessible throughout the application.

---

## 🛠️ Customization

*   **AI Providers & Models**:
    1.  Update `AIProviderName` and `availableProviders` in `src/lib/ai/config.ts`.
    2.  Add corresponding API logic in `src/lib/ai/service.ts` if necessary.
    3.  Ensure the relevant API keys are added to `.env.local`.
    4.  The UI (`ChatInterface`, `ProfilePage`) will automatically reflect the available options.
*   **UI Theme**:
    *   Modify `tailwind.config.ts` to change the default daisyUI themes or customize theme colors. See the [daisyUI Theme Generator](https://daisyui.com/theme-generator/).
    *   Adjust base styles in `src/app/globals.css`.
*   **Adding Features**:
    1.  Create new components in `src/components/`.
    2.  Add API endpoints in `src/app/api/` if backend logic is needed.
    3.  Create new pages within `src/app/(main)/`.
    4.  Update navigation links in `src/components/layout/navigation.tsx`.

---

## ☁️ Deployment

Deploy the application easily using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/ai-agent-playground) <!-- Replace with your repo URL -->

**Important:** Ensure all required environment variables from your `.env.local` file are configured in your Vercel project settings.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
