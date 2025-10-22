# RoleVate

A modern Next.js application with internationalization support, built with TypeScript and Tailwind CSS.

## Features

- 🌐 Internationalization (English/Arabic) using next-intl
- ⚡ Next.js 15 with Turbopack for fast development
- 🎨 Tailwind CSS 4 for styling
- 📱 Responsive design
- 🔧 TypeScript for type safety
- 🎯 ESLint for code quality

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── [locale]/       # Internationalized routes
│   ├── globals.css     # Global styles with Tailwind
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
├── i18n/              # Internationalization configuration
├── messages/          # Translation files (en.json, ar.json)
└── middleware.ts      # Next.js middleware for i18n routing
```

## Internationalization

This project supports English and Arabic languages:

- Default locale: English (`en`)
- Supported locales: `en`, `ar`
- Locale prefix: `as-needed` (only shown when not default)

Translation files are located in `src/messages/`.

## Deployment

The project is configured for standalone output, making it suitable for Docker deployments and serverless platforms.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
