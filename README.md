# AI Learning Platform - Next.js SaaS Boilerplate

This is a comprehensive boilerplate for an AI-based SaaS project built with Next.js, Shadcn UI, DaisyUI, and Firebase. It provides a complete starting point for building AI-powered educational tools and services.

## Features

- **AI Chat Interface**: Interactive chat powered by multiple AI providers (OpenAI, Anthropic, Gemini, Groq)
- **Math Exercise Generator**: AI-generated math exercises with customizable difficulty
- **Modern UI**: Responsive design using Shadcn UI and DaisyUI components
- **Authentication**: Firebase authentication with Next Auth integration
- **Database**: Firestore integration for data persistence
- **Storage**: Firebase storage for file uploads
- **API Layer**: Uniform API interface to access various AI models
- **Environment Config**: Secure environment variables setup

## Project Structure

```
src/
  ├── app/ - Next.js App Router pages
  │   ├── page.tsx - Homepage
  │   ├── chat/ - AI Chat feature pages
  │   ├── exercises/ - Math Exercise generator pages
  │   └── api/ - Backend API endpoints
  │       ├── ai/ - AI service endpoints
  │       └── [...nextauth]/ - Authentication endpoints
  ├── components/ - Reusable React components
  │   ├── ai/ - AI-related components
  │   └── ui/ - UI components (buttons, navigation, etc.)
  ├── lib/ - Utility libraries and services
  │   ├── ai/ - AI service implementation
  │   └── firebase.ts - Firebase configuration
  └── auth.ts - Authentication setup
```

## Getting Started

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:

   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"

   # AI APIs
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   GEMINI_API_KEY=your-gemini-api-key
   GROQ_API_KEY=your-groq-api-key

   # Next Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** with your browser to see the application.

## Customizing AI Providers

The boilerplate comes with a unified AI service layer that supports multiple providers. To add or modify AI providers:

1. Update the provider types in `src/lib/ai/config.ts`
2. Add the corresponding API implementation in `src/lib/ai/service.ts`
3. Update the environment variables for API keys

## Extending the Application

### Adding New AI Features

1. Create a new component in `src/components/ai/`
2. Add the corresponding API endpoint in `src/app/api/ai/`
3. Create a page in `src/app/` to display your new feature
4. Update the navigation in `src/components/ui/navigation.tsx` to include a link to your new feature

## Deployment

Deploy the application to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/ai-learning-platform)

Make sure to set up all the required environment variables in your Vercel project settings.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
