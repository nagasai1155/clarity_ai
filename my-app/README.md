# Clarity AI — Gemini-Powered Full-Stack Chat Application

A modern, full-stack AI chat web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Auth.js / NextAuth (Google OAuth)**, **Prisma ORM (MySQL)**, and **Google Gemini API** (via Vercel AI SDK).

---

## ✨ Features

- **Google OAuth Sign-In**: Secure authentication using NextAuth with Google provider.
- **Persistent Conversations**: Complete chat history stored in MySQL via Prisma with cascading deletions.
- **Token-by-Token Streaming**: Low-latency, progressive streaming responses powered by Google Gemini.
- **Smart Auto-Scroll**: Keeps latest tokens in view without disrupting reading when scrolled up.
- **Rich Markdown & Code**: Syntax-highlighted code blocks with a one-click "Copy code" button, tables, lists, and quotes.
- **Response Actions**: One-click "Copy message", "Regenerate response", and "Stop generating".
- **Theme Support**: Seamless light/dark/system mode toggle with localStorage persistence.
- **Responsive Drawer**: Collapsible sidebar with drawer navigation on mobile viewports.
- **Instant Preview Mode**: Can run and be tested immediately even before API keys or MySQL are connected.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your credentials:
```env
DATABASE_URL="mysql://username:password@localhost:3306/clarity_ai"

GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-flash"
```

### 3. Initialize MySQL Database
Run Prisma migration to push schema to your MySQL database:
```bash
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Architecture & File Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth Google OAuth handler
│   │   ├── chat/route.ts                # Gemini token-by-token streaming & DB persistence
│   │   └── conversations/
│   │       ├── route.ts                 # List and create conversations
│   │       └── [id]/route.ts            # Read, rename, and delete conversation
│   ├── globals.css                      # Tailwind v4 theme & sleek scrollbars
│   ├── layout.tsx                       # Root layout with Auth & Theme providers
│   └── page.tsx                         # Main app orchestrator
├── components/
│   ├── auth/                            # Auth triggers
│   ├── chat/
│   │   ├── ChatInput.tsx                # Auto-resizing input with Enter/Shift+Enter & Stop button
│   │   ├── ChatWindow.tsx               # Primary chat orchestrator
│   │   ├── EmptyState.tsx               # Greeting & clickable prompt suggestions
│   │   ├── MarkdownRenderer.tsx         # Markdown, tables, code blocks with copy
│   │   ├── MessageBubble.tsx            # User vs Assistant styling with action toolbar
│   │   └── MessageList.tsx              # Auto-scrolling list with scroll-to-bottom button
│   ├── landing/
│   │   └── LandingPage.tsx              # Unauthenticated landing & demo exploration
│   ├── providers/
│   │   └── AuthProvider.tsx             # NextAuth SessionProvider wrapper
│   ├── sidebar/
│   │   ├── ConversationItem.tsx         # Conversation row with rename & delete
│   │   └── Sidebar.tsx                  # Collapsible history sidebar with search
│   └── theme/
│       ├── ThemeProvider.tsx            # Light/Dark/System theme context
│       └── ThemeToggle.tsx              # Animated Sun/Moon toggle button
├── lib/
│   ├── auth.ts                          # NextAuth configuration & callbacks
│   └── prisma.ts                        # Singleton PrismaClient
└── prisma/
    └── schema.prisma                    # User, Account, Conversation, Message schema
```

---

## 🔑 Google Cloud Setup (Google OAuth)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project or select an existing one.
3. Under **APIs & Services** > **Credentials**, create an **OAuth 2.0 Client ID**.
4. Set **Application Type** to *Web application*.
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy `Client ID` and `Client Secret` into `.env.local`.

---

## 🤖 Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and generate a key.
3. Paste the key into `GEMINI_API_KEY` in `.env.local`.
