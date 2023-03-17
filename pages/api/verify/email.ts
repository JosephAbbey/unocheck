import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { createHash, randomBytes } from "crypto"
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import EmailProvider from "next-auth/providers/email"

// import nodemailer from "nodemailer"

import prisma from "~lib/prisma"

import { options } from "../auth/[...nextauth]"

/**
 * Starts an e-mail login flow, by generating a token,
 * and sending it to the user's e-mail (with the help of a DB adapter)
 */
async function email(
  identifier: string,
  options: {
    url: URL
    adapter: any
    provider: any
    callbackUrl: string
    secret: string
    theme: {
      colorScheme?: "auto" | "dark" | "light"
      logo?: string
      brandColor?: string
      buttonText?: string
    }
  }
): Promise<string> {
  const { url, adapter, provider, callbackUrl, theme, secret } = options
  // Generate token
  const token =
    (await provider.generateVerificationToken?.()) ??
    randomBytes(32).toString("hex")

  const ONE_DAY_IN_SECONDS = 86400
  const expires = new Date(
    Date.now() + (provider.maxAge ?? ONE_DAY_IN_SECONDS) * 1000
  )

  // Generate a link with email, unhashed token and callback url
  const params = new URLSearchParams({ callbackUrl, token, email: identifier })
  const _url = `${url}/callback/${provider.id}?${params}`

  await Promise.all([
    // Send to user
    provider.sendVerificationRequest({
      identifier,
      token,
      expires,
      url: _url,
      provider,
      theme
    }),
    // Save in database
    adapter.createVerificationToken({
      identifier,
      token: createHash("sha256")
        // Prefer provider specific secret, but use default secret if none specified
        .update(`${token}${secret}`)
        .digest("hex"),
      expires
    })
  ])

  return `${url}/verify-request?${new URLSearchParams({
    provider: provider.id,
    type: provider.type
  })}`
}

const validate = (email: string): boolean => {
  return Boolean(
    email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  )
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { identifier } = req.query
  if (identifier instanceof Array) return res.status(400).end()
  const session = await getServerSession(req, res, options)
  if (session) {
    if (!validate(identifier))
      return res.redirect(
        "/verify/email?identifier=" + identifier + "&error=invalid"
      )

    // const transport = nodemailer.createTransport({
    //   host: process.env.EMAIL_SERVER_HOST,
    //   port: parseInt(process.env.EMAIL_SERVER_PORT),
    //   auth: {
    //     user: process.env.EMAIL_SERVER_USER,
    //     pass: process.env.EMAIL_SERVER_PASSWORD
    //   }
    // })

    // await transport.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: identifier,
    //   subject: "Message",
    //   text: "I hope this message gets read!"
    // })

    const r = await prisma.email.upsert({
      create: {
        email: identifier,
        verified: false,
        //@ts-expect-error
        userId: session.user.id
      },
      update: {},
      where: {
        email: identifier
      }
    })

    //@ts-expect-error
    if (r.userId != session.user.id) return res.status(401).end()

    await email(identifier, {
      url: new URL("http://localhost:3000/api/verify"),
      callbackUrl: "http://localhost:3000/api/verify/callback/email",
      adapter: PrismaAdapter(prisma),
      provider: {
        ...EmailProvider({
          server: {
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD
            }
          },
          from: process.env.EMAIL_FROM
        }),
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: parseInt(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD
          }
        },
        from: process.env.EMAIL_FROM
      },
      theme: {
        colorScheme: "auto",
        logo: "",
        brandColor: "#227755",
        buttonText: "verify"
      },
      secret: "hi"
    })

    res.redirect("/")
  } else {
    // Not Signed in
    res.status(401).end()
  }
}
