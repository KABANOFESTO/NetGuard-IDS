// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

// Extend the default User type
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
    token: string; // Ensure token is added
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      token: string;
    } & DefaultSession["user"]; // Retain default fields (name, email, etc.)
  }
}
