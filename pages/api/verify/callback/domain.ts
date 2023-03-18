import dns from "dns/promises"
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"

import prisma from "~lib/prisma"

import { options } from "../../auth/[...nextauth]"

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { identifier } = req.query
  if (identifier instanceof Array) return res.status(400).end()
  const session = await getServerSession(req, res, options)
  if (session) {
    const r = await prisma.domain.findUnique({
      where: {
        domain: identifier
      }
    })

    //@ts-expect-error
    if (r.userId != session.user.id) return res.status(401).end()

    try {
      for (let txt of await dns.resolveTxt("__unocheck." + identifier)) {
        //@ts-expect-error
        if (txt == session.user.id) {
          await prisma.domain.update({
            where: {
              domain: identifier
            },
            data: {
              verified: true
            }
          })
          return res.redirect("/")
        }
      }
    } catch (e) {
      console.log(e)
    }

    // failed dns
    res.redirect("/verify/callback/domain?identifier=" + identifier)
  } else {
    // Not Signed in
    res.status(401).end()
  }
}
