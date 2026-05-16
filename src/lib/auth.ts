import { prisma } from '#/db'
import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const auth = betterAuth({
  debug: true,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders:{
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: [
        'email',
        'profile',
        'openid',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/presentations'
      ],
      mapQuery(url, key) {
        if (key === "authorization") {
          url.searchParams.set("prompt", "select_account consent");
          url.searchParams.set("access_type", "offline");
        }
        return url;
      },
    },
    github:{
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.workspaceMember.create({
            data: {
              role: "OWNER",
              userId: user.id,
              workspace: {
                create: {
                  name: `${user.name || user.email.split('@')[0]}'s Workspace`,
                }
              }
            }
          })
        }
      }
    }
  },
  plugins: [tanstackStartCookies()],
})
