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
      console.log("Sign in callback", { user, account, profile });
      
      if (!user.email) {
        return false; // Prevent sign-in if email is not available
      }
      
      try {
        await prismaClient.user.upsert({
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
            createdAt: new Date(),
          }
        });
      } catch (error) {
        console.error("Error creating/updating user:", error);
        return false; // Prevent sign-in if database operation fails
      }
      
      return true;
    },
    
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const user = await prismaClient.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              provider: true,
              createdAt: true,
            }
          });
          
          if (user) {
            session.user = {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              provider: user.provider,
              createdAt: user.createdAt,
            };
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error);
        }
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };