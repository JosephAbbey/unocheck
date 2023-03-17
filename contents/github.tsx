import { ApolloProvider } from "@apollo/client"
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoGetInlineAnchor
} from "plasmo"

import { querySelector } from "@plasmohq/selector"

import Check from "~components/Check"
import client from "~lib/apollo-client"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"]
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  return querySelector(".author")
}

function Content({ anchor }: { anchor: PlasmoCSUIAnchor }) {
  if (anchor.element instanceof HTMLSpanElement) {
    return (
      <Check
        color={{
          fg: "var(--color-accent-fg)",
          er: "var(--color-danger-fg)",
          bg: "var(--color-canvas-overlay)"
        }}
        username={anchor.element.innerText}
        provider="github"
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
