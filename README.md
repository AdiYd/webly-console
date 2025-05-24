# 🚀 Next.js AI Chat Boilerplate

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![daisyUI](https://img.shields.io/badge/daisyUI-5+-lightgrey?logo=daisyui&logoColor=black)](https://daisyui.com/) [![Firebase](https://img.shields.io/badge/Firebase-SDK_v10+-orange?logo=firebase&logoColor=white)](https://firebase.google.com/) [![AI SDK](https://img.shields.io/badge/AI_SDK-4+-black?logo=vercel&logoColor=white)](https://ai-sdk.dev/) [![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5+-blue?logo=nextdotjs&logoColor=white)](https://next-auth.js.org/)

A simple, modern boilerplate for building AI chat applications with Next.js, Firebase authentication, and AI capabilities. This project provides a clean starting point for developing AI-powered chat applications with a professional UI/UX using Tailwind CSS and daisyUI.

---

## ✨ Features

* **🤖 AI Chat Interface**: Interactive chat widget powered by the AI SDK, supporting multiple AI providers (OpenAI, Anthropic, etc.)
* **🔥 Firebase Authentication**: Secure user login and management integrated with NextAuth.js
* **🎨 Modern UI/UX**: Clean, professional interface built with Tailwind CSS and daisyUI components
* **🌓 Theme Support**: Built-in light/dark mode theme switching
* **⚙️ Environment Configuration**: Secure setup for environment variables
* **📐 TypeScript**: Strong typing for enhanced code quality and maintainability
* **🚀 Next.js App Router**: Leverages the latest Next.js features for optimal performance

---

## 🏗️ Project Structure

```plaintext
webly-console/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── api/            # Backend API endpoints
│   │   │   └── ai/chat/    # AI chat endpoint
│   │   ├── auth/           # Authentication pages (signin, signup)
│   │   ├── chat/           # AI Chat feature page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable React components
│   │   ├── ai/             # AI-specific components (ChatInterface)
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   └── ui/             # General UI components (buttons, theme toggle)
│   ├── lib/                # Utility libraries and services
│   │   ├── auth/           # Authentication utilities
│   │   ├── firebase/       # Firebase configuration
│   │   └── tools/          # Tools and utilities for AI
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── auth.ts             # NextAuth.js configuration
├── .env.example            # Example environment variables file
├── .env.local              # Environment variables (local development)
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS & daisyUI configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* npm, yarn, or pnpm
* Firebase account
* API keys for AI providers (OpenAI, Anthropic, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/webly-console.git
   cd webly-console
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   * Copy the example environment file:
     ```bash
     cp .env.example .env.local
     ```
   * Fill in the required values in `.env.local`:
     * Firebase configuration
     * AI provider API keys (OpenAI, Anthropic)
     * NextAuth.js secret

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 💡 Key Components

### Authentication

The project uses NextAuth.js integrated with Firebase Authentication:

* **Sign Up/Sign In**: Standard email/password authentication
* **Session Management**: JWT-based sessions with customizable expiration
* **User Profiles**: Basic user information storage

### AI Chat

The AI chat functionality is built with the AI SDK:

* **Chat Interface**: Clean, intuitive UI for interacting with AI models
* **Multiple Providers**: Support for various AI providers through a unified API
* **Streaming Responses**: Real-time streaming of AI responses
* **Code Formatting**: Proper formatting of code blocks in chat responses

---

## 🛠️ Customization

### Adding AI Providers

1. Add your API keys to `.env.local`
2. Update the provider configuration in `src/app/api/ai/chat/route.ts`
3. Modify the `ChatInterface` component to include the new provider options

### Customizing UI Theme

* Modify `tailwind.config.ts` to change the default daisyUI themes or customize theme colors
* Use the [daisyUI Theme Generator](https://daisyui.com/theme-generator/) to create custom themes
* Adjust base styles in `src/app/globals.css`

---

## 🚢 Deployment

### Deploying to Vercel

1. Push your repository to GitHub/GitLab/Bitbucket
2. Import the project into Vercel
3. Configure environment variables
4. Deploy!

### Environment Variables for Production

Ensure you set the following environment variables in your production environment:

* All Firebase configuration values
* AI provider API keys
* NextAuth.js secret and URL

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

* [Next.js](https://nextjs.org/)
* [Firebase](https://firebase.google.com/)
* [AI SDK](https://ai-sdk.dev/)
* [NextAuth.js](https://next-auth.js.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [daisyUI](https://daisyui.com/)
