import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "placeholder",
    }),
  ],
  pages: {
    signIn: "/account/login",
  },
});

export { handler as GET, handler as POST };