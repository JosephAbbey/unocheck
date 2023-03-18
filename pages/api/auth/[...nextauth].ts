import { PrismaAdapter } from "@next-auth/prisma-adapter"
import NextAuth, { AuthOptions } from "next-auth"
import GithubProvider, { GithubProfile } from "next-auth/providers/github"
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google"
import FacebookProvider, { FacebookProfile } from "next-auth/providers/facebook"
import GitlabProvider, { GitLabProfile } from "next-auth/providers/gitlab"

import prisma from "../../../lib/prisma"

// Required for verification:
const followers = 5;

export const options: AuthOptions = {
  secret: process.env.SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      name: "YouTube",
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
    }),
    GitlabProvider({
      clientId: process.env.GITLAB_ID,
      clientSecret: process.env.GITLAB_SECRET
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        //@ts-expect-error
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ account, profile, user }) {
      console.log(account)
      switch (account.provider) {
        case "google":
          try {
            const { statistics: { subscriberCount }, brandingSettings: { channel: { title } } } = (await (await import("@googleapis/youtube")).youtube("v3").channels.list({
              mine: true,
              access_token: account.access_token,
              part: ["statistics", "brandingSettings"]
            }, {})).data.items[0]
            console.log("google", profile)
            await prisma.profile.upsert({
              create: {
                username: title,
                providerAccountId: account.providerAccountId,
                provider: "google",
                image: (<GoogleProfile>profile).picture,
                follower: parseInt(subscriberCount) > followers,
              },
              update: {
                username: title,
                image: (<GoogleProfile>profile).picture,
                follower: parseInt(subscriberCount) > followers,
              },
              where: {
                provider_providerAccountId: {
                  provider: "google",
                  providerAccountId: account.providerAccountId
                }
              }
            })
            await prisma.email.upsert({
              create: {
                email: (<GoogleProfile>profile).email,
                verified: (<GoogleProfile>profile).email_verified,
                userId: user.id
              },
              update: {
                userId: user.id
              },
              where: {
                email: (<GoogleProfile>profile).email
              }
            })
          } catch (e) {
            console.log(e)
          }
          break
        case "github":
          console.log("github", profile)
          try {
            await prisma.profile.upsert({
              create: {
                username: (<GithubProfile>profile).login,
                providerAccountId: account.providerAccountId,
                provider: "github",
                image: (<GithubProfile>profile).avatar_url,
                follower: (<GithubProfile>profile).followers > followers,
              },
              update: {
                username: (<GithubProfile>profile).login,
                image: (<GithubProfile>profile).avatar_url,
                follower: (<GithubProfile>profile).followers > followers,
              },
              where: {
                provider_providerAccountId: {
                  provider: "github",
                  providerAccountId: account.providerAccountId
                }
              }
            })
            const domain = (<GithubProfile>profile).login.toLowerCase() + ".github.io"
            await prisma.domain.upsert({
              create: {
                domain,
                verified: true,
                userId: user.id
              },
              update: {
                userId: user.id
              },
              where: {
                domain
              }
            })
          } catch (e) {
            console.log(e)
          }
          break
        case "facebook":
          console.log("facebook", profile)
          try {
            await prisma.profile.upsert({
              create: {
                username: (<FacebookProfile>profile).name,
                providerAccountId: account.providerAccountId,
                provider: "facebook",
                image: (<FacebookProfile>profile).picture.data.url,
              },
              update: {
                username: (<FacebookProfile>profile).name,
                image: (<FacebookProfile>profile).picture.data.url,
              },
              where: {
                provider_providerAccountId: {
                  provider: "facebook",
                  providerAccountId: account.providerAccountId
                }
              }
            })
          } catch (e) {
            console.log(e)
          }
          break
        case "gitlab":
          console.log("gitlab", profile)
          try {
            await prisma.profile.upsert({
              create: {
                username: (<GitLabProfile>profile).username,
                providerAccountId: account.providerAccountId,
                provider: "gitlab",
                image: (<GitLabProfile>profile).avatar_url,
                follower: (<GitLabProfile>profile).followers > followers,
              },
              update: {
                username: (<GitLabProfile>profile).username,
                image: (<GitLabProfile>profile).avatar_url,
              },
              where: {
                provider_providerAccountId: {
                  provider: "gitlab",
                  providerAccountId: account.providerAccountId
                }
              }
            })
          } catch (e) {
            console.log(e)
          }
          break
        default:
          console.log(account.provider, profile)
      }
      return true
    }
  }
}

export default NextAuth(options)
