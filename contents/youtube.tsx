import { ApolloProvider } from "@apollo/client"
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoGetInlineAnchorList
} from "plasmo"

import { querySelectorAll } from "@plasmohq/selector"

import Check from "~components/Check"
import client from "~lib/apollo-client"

export const config: PlasmoCSConfig = {
  matches: ["https://youtube.com/*", "https://www.youtube.com/*"]
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = () => {
  return querySelectorAll("#container.ytd-channel-name")
}

function Content({ anchor }: { anchor: PlasmoCSUIAnchor }) {
  const element = anchor.element.children[0]
  if (element instanceof HTMLDivElement) {
    anchor.element.parentElement.parentElement.style.overflow = "visible"
    return (
      <Check
        color={{
          fg: "var(--yt-spec-text-primary)",
          er: "var(--error-color)",
          bg: "var(--yt-spec-raised-background)"
        }}
        username={element.innerText.trim()}
        provider="google"
      />
    )
  }
  return <></>
}

export default function (props) {
  return (
    <ApolloProvider client={client}>
      <Content {...props} />
    </ApolloProvider>
  )
}
