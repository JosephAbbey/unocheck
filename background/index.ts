import { gql } from "@apollo/client"

import verified from "../assets/verified.png"
import client from "../lib/apollo-client"

export {}

const JustDomainQuery = gql`
  query JustDomainQuery($domain: String!) {
    justDomain(domain: $domain) {
      verified
    }
  }
`

chrome.tabs.onUpdated.addListener(async (tabId, _, { url }) => {
  if (url) {
    const { data } = await client.query({
      query: JustDomainQuery,
      variables: {
        domain: new URL(url).hostname.replace(/^www\./, "")
      }
    })
    console.log(new URL(url).hostname.replace(/^www\./, ""), data)
    if (data.justDomain?.verified)
      //@ts-expect-error
      chrome.action.setIcon({ path: verified, tabId }, () => {})
  }
})
