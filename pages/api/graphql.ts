import SchemaBuilder from "@pothos/core"
import PrismaPlugin from "@pothos/plugin-prisma"
import type PrismaTypes from "@pothos/plugin-prisma/generated"
import { createYoga } from "graphql-yoga"
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "../../lib/prisma"

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma
  },
  notStrict:
    "Pothos may not work correctly when strict mode is not enabled in tsconfig.json"
})

builder.queryType({})

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email", { nullable: true }),
    name: t.exposeString("name", { nullable: true }),
    accounts: t.relation("accounts", {}),
    domains: t.relation("domains", {}),
    emails: t.relation("emails", {})
  })
})

builder.prismaObject("Email", {
  fields: (t) => ({
    email: t.exposeID("email"),
    verified: t.exposeBoolean("verified"),
    user: t.relation("user", {})
  })
})

builder.prismaObject("Domain", {
  fields: (t) => ({
    domain: t.exposeID("domain"),
    verified: t.exposeBoolean("verified"),
    user: t.relation("user", {})
  })
})

builder.prismaObject("Profile", {
  fields: (t) => ({
    username: t.exposeID("username"),
    account: t.relation("account", {}),
    provider: t.exposeString("provider"),
    image: t.exposeString("image"),
    follower: t.exposeBoolean("follower", { nullable: true })
  })
})

builder.prismaObject("Account", {
  fields: (t) => ({
    id: t.exposeID("id"),
    user: t.relation("user", {}),
    type: t.exposeString("type"),
    provider: t.exposeString("provider"),
    providerAccountId: t.exposeString("providerAccountId"),
    profile: t.relation("profile", { nullable: true })
  })
})

builder.queryField("domain", (t) =>
  t.prismaField({
    type: "User",
    args: {
      domain: t.arg.string({ required: true })
    },
    nullable: true,
    resolve: async (query, _parent, args, _info) =>
      await prisma.domain
        .findUnique({
          where: {
            domain: args.domain
          }
        })
        .user({
          ...query
        })
  })
)

builder.queryField("justDomain", (t) =>
  t.prismaField({
    type: "Domain",
    args: {
      domain: t.arg.string({ required: true })
    },
    nullable: true,
    resolve: async (query, _parent, args, _info) =>
      prisma.domain.findUnique({
        where: {
          domain: args.domain
        },
        ...query
      })
  })
)

builder.queryField("userId", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.string({ required: true })
    },
    nullable: true,
    resolve: async (query, _parent, args, _info) =>
      await prisma.user.findUnique({
        where: { id: args.id },
        ...query
      })
  })
)

builder.queryField("user", (t) =>
  t.prismaField({
    type: "User",
    args: {
      provider: t.arg.string({ required: true }),
      username: t.arg.string({ required: true })
    },
    nullable: true,
    resolve: async (query, _parent, args, _info) =>
      await prisma.profile
        .findUnique({
          where: {
            provider_username: {
              provider: args.provider,
              username: args.username
            }
          }
        })
        .account()
        .user({
          ...query
        })
  })
)

builder.queryField("emails", (t) =>
  t.prismaField({
    type: ["Email"],
    args: {
      id: t.arg.string({ required: true })
    },
    nullable: true,
    resolve: async (query, _parent, args, _info) =>
      await prisma.user
        .findUnique({
          where: {
            id: args.id
          }
        })
        .emails({
          ...query
        })
  })
)

builder.queryField("domains", (t) =>
  t.prismaField({
    type: ["Domain"],
    args: {
      id: t.arg.string({ required: true })
    },
    nullable: true,
    resolve: async (query, _parent, args, _info) =>
      await prisma.user
        .findUnique({
          where: {
            id: args.id
          }
        })
        .domains({
          ...query
        })
  })
)

const schema = builder.toSchema()

// import("fs").then((fs) => {
//   import("graphql")
//     .then((gql) => gql.printSchema(builder.toSchema()))
//     .then((o) => fs.writeFileSync("./generated/schema.graphql", o))
// })

export default createYoga<{
  req: NextApiRequest
  res: NextApiResponse
}>({
  schema,
  graphqlEndpoint: "/api/graphql"
})

export const config = {
  api: {
    bodyParser: false
  }
}
