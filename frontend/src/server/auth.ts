import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type Session,
} from "next-auth";
import { type AdapterUser, type Adapter } from "next-auth/adapters";
import { type JWT } from "next-auth/jwt";
import Email from "next-auth/providers/email";
import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      onboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    onboarded: boolean;
  }
}

const EmailProvider = Email({
  server: {
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT),
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  },
  from: `HoosInvesting <${env.EMAIL_FROM}>`,
});

export const SEVEN_DAYS_IN_SECONDS = 604800;

interface SessionCallbackParams {
  session: Session;
  token: JWT;
  user: AdapterUser;
  newSession: unknown;
  trigger: "update";
}

const session = ({ session, user }: SessionCallbackParams) => {
  if (session.user) {
    session.user = { ...user };
  }
  return session;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session,
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
    EmailProvider,
  ],

  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: SEVEN_DAYS_IN_SECONDS,
    updateAge: SEVEN_DAYS_IN_SECONDS,
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
