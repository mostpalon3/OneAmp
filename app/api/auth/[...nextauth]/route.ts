import { prismaClient } from "@/app/lib/db";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
      createdAt?: Date;
    }
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 Sign in attempt for:", user.email);
      
      if (!user.email) {
        console.log("❌ No email provided");
        return false;
      }
      
      try {
        const result = await prismaClient.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name || "",
            image: user.image || "",
          },
          create: {
            email: user.email,
            name: user.name || "",
            image: user.image || "",
            provider: "GOOGLE",
          }
        });
        
        console.log("User upserted successfully:", result.id);
        return true;
      } catch (error) {
        console.error("Database error during sign in:", error);
        return false;
      }
    },
    
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          // Use upsert to handle missing user scenario
          const user = await prismaClient.user.upsert({
            where: { email: session.user.email },
            update: {
              // Update existing user with latest session data
              name: session.user.name || "",
              image: session.user.image || "",
            },
            create: {
              // Create user if they don't exist (database was reset)
              email: session.user.email,
              name: session.user.name || "",
              image: session.user.image || "",
              provider: "GOOGLE",
            },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              provider: true,
              createdAt: true,
            }
          });
          
          // Update session with database user data
          session.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            provider: user.provider,
            createdAt: user.createdAt,
          };
          
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };