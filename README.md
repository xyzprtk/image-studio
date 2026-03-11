# Vibe Studio

A unified AI image generation interface that allows users to generate images using multiple providers from a single dashboard with prompt templates and generation history.

## Features

- **Multi-Provider Support**: OpenAI DALL-E, Google Imagen, Stability AI, Replicate (Flux, Midjourney)
- **Prompt Templates**: Built-in and custom templates with variable placeholders
- **Generation History**: Auto-save all generations with search and filter capabilities
- **API Key Management**: Secure local storage for provider API keys
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- API keys from supported providers

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Configuration

Before generating images, you need to configure your API keys:

1. Navigate to the **Providers** page
2. Enter your API key for each provider
3. Click **Test** to verify the connection

### Provider API Keys

| Provider | API Key URL |
|----------|-------------|
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Stability AI | [platform.stability.ai](https://platform.stability.ai/account/keys) |
| Replicate | [replicate.com](https://replicate.com/account/api-tokens) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main generation page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── gallery/           # Generation history
│   ├── providers/         # API key management
│   └── templates/         # Prompt templates
├── components/
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── MobileNav.tsx     # Mobile navigation
│   └── ui.tsx            # Reusable UI components
├── lib/
│   ├── types.ts          # TypeScript types
│   ├── api.ts            # Provider API calls
│   └── utils.ts          # Utility functions
└── store/
    └── index.ts           # Zustand state management
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | TypeScript type check |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand with persist middleware
- **Icons**: Lucide React
- **Fonts**: Trocchi (headings), Geist (body)

## License

MIT License - see LICENSE file for details
