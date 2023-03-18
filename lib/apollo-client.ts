import { ApolloClient, InMemoryCache } from "@apollo/client"

export default new ApolloClient({
  uri: process.env.URI + "/api/graphql",
  cache: new InMemoryCache()
})
