import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { createHash, randomBytes } from "crypto"
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "~lib/prisma"

const url = process.env.NEXT_PUBLIC_URI + "/api/verify"
const secret = "hi"
const adapter = PrismaAdapter(prisma)

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { query, cookies } = req

  try {
    const token = query?.token as string | undefined
    const identifier = query?.email as string | undefined

    // If these are missing, the sign-in URL was manually opened without these params or the `sendVerificationRequest` method did not send the link correctly in the email.
    if (!token || !identifier)
      return res.redirect(`${url}/error?error=configuration`)

    const invite = await adapter.useVerificationToken({
      identifier,
      token: createHash("sha256")
        // Prefer provider specific secret, but use default secret if none specified
        .update(`${token}${secret}`)
        .digest("hex")
    })

    if (!invite || invite.expires.valueOf() < Date.now())
      return res.redirect(`${url}/error?error=Verification`)

    await prisma.email.update({
      where: {
        email: invite.identifier
      },
      data: {
        verified: true
      }
    })

    return res.redirect("/")
  } catch (error) {
    return res.redirect(`${url}/error?error=Callback`)
  }
}
