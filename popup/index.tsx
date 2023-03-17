import { ApolloProvider, gql, useQuery } from "@apollo/client"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import ErrorIcon from "@mui/icons-material/Error"
import FacebookIcon from "@mui/icons-material/Facebook"
import GitHubIcon from "@mui/icons-material/GitHub"
import PendingIcon from "@mui/icons-material/Pending"
import TwitterIcon from "@mui/icons-material/Twitter"
import VerifiedIcon from "@mui/icons-material/Verified"
import YouTubeIcon from "@mui/icons-material/YouTube"
import React from "react"

import client from "../lib/apollo-client"

const UserQuery = gql`
  query UserQuery($provider: String!, $username: String!) {
    user(provider: $provider, username: $username) {
      id
      accounts {
        profile {
          provider
          username
          image
          follower
        }
      }
      emails {
        email
        verified
      }
      domains {
        domain
        verified
      }
    }
  }
`

function Popup() {
  const { loading, error, data } = useQuery<{
    user: {
      id: string
      accounts: {
        profile: {
          provider: string
          username: string
          image: string
          follower: boolean | null
        } | null
      }[]
      emails: {
        email: string
        verified: boolean
      }[]
      domains: {
        domain: string
        verified: boolean
      }[]
    } | null
  }>(UserQuery, {
    variables: { username: "JosephAbbey", provider: "github" }
  })

  return loading ? (
    <></>
  ) : error ? (
    <></>
  ) : data.user ? (
    <>
      <style jsx>{`
        .verified {
          position: absolute;
          width: max-content;
          background-color: grey;
          transform: translate(1.2em, 50%);
          border-radius: 0.3em;
          overflow: hidden;
          border: 1px solid black;
        }
        .verified > div {
          display: flex;
          min-width: 10em;
          flex-wrap: nowrap;
          align-items: center;
          gap: 0.2em;
          padding: 0.2em;
        }
        .verified > div > * {
          flex-shrink: 0;
        }
        .verified > div > img {
          height: 1.5em;
          border-radius: 50%;
        }
        .verified > div > .value {
          flex-grow: 1;
          display: flex;
          justify-content: flex-end;
          cursor: pointer;
        }
        .verified > div > .value > span {
          font-size: 0.8em;
          border-radius: 0.75em;
          height: 1em;
          background-color: #aaaaaaaa;
          font-family: monospace;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .verified > div > .value > span > span {
          font-size: 0.8em;
          padding-left: 0.4em;
        }

        .verified > .google {
          background-color: #ff0000;
        }
        .verified > .twitter {
          background-color: #1da1f2;
        }
        .verified > .facebook {
          background-color: #4267b2;
        }
        .verified > .github {
          background-color: #161b22;
        }
      `}</style>
      <div className="verified">
        {data.user.accounts.map(({ profile }, i) =>
          profile ? (
            <div key={i} className={profile.provider}>
              {profile.provider == "google" ? (
                <YouTubeIcon width="1.5em" fill="white" />
              ) : profile.provider == "twitter" ? (
                <TwitterIcon width="1.5em" fill="white" />
              ) : profile.provider == "facebook" ? (
                <FacebookIcon width="1.5em" fill="white" />
              ) : profile.provider == "github" ? (
                <GitHubIcon width="1.5em" fill="white" />
              ) : (
                <></>
              )}
              <img src={profile.image} />
              <span className="user">{profile.username}</span>
              <span
                className="value"
                onClick={() =>
                  window
                    .open(
                      `http://localhost:3000/user/${data.user.id}#${profile.provider}`,
                      "_blank"
                    )
                    .focus()
                }>
                <span>
                  <span>{[profile.follower].filter(Boolean).length}</span>
                  <ChevronRightIcon
                    height="1em"
                    fill="currentColor"></ChevronRightIcon>
                </span>
              </span>
            </div>
          ) : (
            <></>
          )
        )}
      </div>
    </>
  ) : (
    <></>
  )
}

export default function IndexPopup() {
  return (
    <ApolloProvider client={client}>
      <Popup />
    </ApolloProvider>
  )
}
