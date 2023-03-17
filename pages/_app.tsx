import { ApolloProvider } from "@apollo/client"
import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"

import client from "../lib/apollo-client"

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </SessionProvider>
  )
}
