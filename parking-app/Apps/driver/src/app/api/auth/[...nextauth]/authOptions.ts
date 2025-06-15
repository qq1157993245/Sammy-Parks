import { Account, Profile, Session } from "next-auth"
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google"
import { grabuuidfromoauth } from "../../../../auth/service";
import * as jwt from "jsonwebtoken"

export interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    uuid?: string;
    roles?: string[];
  }
}

//I used chatgpt to add this stuff between these two comments
// 
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      uuid?: string;
      role?: string[];
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string[];
  }
}

// 
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          //redirect_uri: "http://localhost:3050/driver/api/auth/callback/google"
          //redirect_uri: "https://sammyparks.com/driver/api/auth/callback/google"
          redirect_uri: process.env.AUTHREDIRECT
        }
      }
    }),
  ],

  cookies: {
    sessionToken: {
      name: "session",
      options: {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 30 * 60 * 1000),
        sameSite: 'lax' as const,
        path: '/',
      }
    }
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 1800,      
    updateAge: 0,       
  },

  debug: true,
  /* pages: {
  signIn: '/driver/login'  }, */
  callbacks: {
    async jwt({ token, account, profile }: {
      token: JWT;
      account?: Account | null;
      profile?: Profile;
    }) {
      if (account && profile?.email) {
        try {
          token.roles = ["driver"];
          const uuid = await grabuuidfromoauth(account.providerAccountId, profile.email, profile.name)
          token.id = uuid
          token.name = profile.name
        }
        catch {
          console.log("Error")
        }
      }
      return token
    },

    async session({ session, token }: {
      token: JWT,
      session: ExtendedSession
    }) {
      session.user.uuid = token.id as string;
      session.user.roles = token.role as string[];
      session.user.name = token.name as string;
      // console.log(token)
      // session.user.uuid = token.uuid
      // session.user.role = "driver"
      return session
    },
  },

  jwt: {
    secret: process.env.MASTER_SECRET,
    maxAge: 1800,
    encrypted: false,
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encode: async function ({ token, secret }: any): Promise<string> {
      if (!token || !secret) {
        throw new Error("Missing token or secret");
      }

      const signed = jwt.sign(token as object, secret, { algorithm: 'HS256' });

      if (typeof signed !== "string") {
        throw new Error("JWT signing failed to return a string");
      }

      return signed;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decode: async function ({ token, secret }: any): Promise<JWT | null> {
      try {
        return jwt.verify(token, secret) as JWT;
      } catch (err) {
        console.error("JWT decode error:", err);
        return null;
      }
    }
  }
}

export default authOptions;