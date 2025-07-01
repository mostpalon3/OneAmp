# OneAmp

[![Live Demo](https://img.shields.io/badge/Live%20Demo-oneamp.vercel.app-blue?style=for-the-badge&logo=vercel)](https://oneamp.vercel.app)

<p align="center">
  <img src="public/thumbnail.png" alt="OneAmp Thumbnail" width="full"/>
</p>

OneAmp is a collaborative music streaming platform that lets users create, join, and manage interactive music jams. Stream music from Spotify and YouTube, let your audience vote on the queue in real-time, and enjoy a seamless, multi-platform experience.

## Features

- 🎵 **Multi-Platform Music**: Add songs from Spotify and YouTube.
- 🗳️ **Live Voting**: Audience can vote and shape the queue in real-time.
- 📊 **Analytics Dashboard**: Track stream performance and engagement.
- 📱 **Mobile Optimized**: Stream and manage from any device.
- 👥 **User Profiles**: Complete your profile and connect with others.
- 🔒 **Google Authentication**: Secure sign-in with Google.
- 🖼️ **QR Code Sharing**: Share jams easily with QR codes.

## 🛠️ Tech Stack

![NextJS](https://img.shields.io/badge/NextJS-black?style=for-the-badge&logo=Next.js&logoColor=white&color=black)
![TypeScript](https://img.shields.io/badge/Typescript-b?style=for-the-badge&logo=typescript&logoColor=white&color=3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-b?style=for-the-badge&logo=tailwindcss&logoColor=black&color=06B6D4)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-fff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHdpZHRoPSIxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iOCIvPjwvc3ZnPg==&logoColor=black&color=fff)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-fff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHdpZHRoPSIxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iOCIvPjwvc3ZnPg==&logoColor=black&color=fff)
![React Hot Toast](https://img.shields.io/badge/React%20Hot%20Toast-fff?style=for-the-badge&logo=react&logoColor=black&color=fff)
![QRCode](https://img.shields.io/badge/QRCode-000?style=for-the-badge&logo=qrcode&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3178C6?style=for-the-badge&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (used as the package manager)
- [PostgreSQL](https://www.postgresql.org/) or another supported database

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/oneamp.git
   cd oneamp
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   ```

3. **Configure environment variables:**
   - Create `.env` and fill in your database and OAuth credentials.

4. **Set up the database:**
   ```sh
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

5. **Run the development server:**
   ```sh
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```sh
pnpm build
pnpm start
```

## Project Structure

- `app/` - Next.js app directory (pages, components, API routes)
- `components/` - Shared UI components
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets
- `doc/` - Documentation assets

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (runs Prisma generate & migrate)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## License

MIT

---

Made with ❤️ by mostpalon3