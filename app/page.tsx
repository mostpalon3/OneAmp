"use client";

import { AppBar } from "./components/AppBar";

export default function Home() {
  console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
  return (
    <main>
      <AppBar/>
    </main>
  );
}
