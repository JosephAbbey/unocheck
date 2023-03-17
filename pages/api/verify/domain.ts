import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"

import prisma from "~lib/prisma"

import { options } from "../auth/[...nextauth]"

const validate = (domain: string): boolean => {
  return Boolean(
    domain.match(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
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
        "/verify/domain?identifier=" + identifier + "&error=invalid"
      )

    const r = await prisma.domain.upsert({
      create: {
        domain: identifier,
        verified: false,
        //@ts-expect-error
        userId: session.user.id
      },
      update: {},
      where: {
        domain: identifier
      }
    })

    //@ts-expect-error
    if (r.userId != session.user.id) return res.status(401).end()

    res.redirect("/verify/callback/domain?identifier=" + identifier)
  } else {
    // Not Signed in
    res.status(401).end()
  }
}
