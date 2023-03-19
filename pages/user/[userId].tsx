import { gql, useQuery } from "@apollo/client"
import DomainIcon from "@mui/icons-material/DomainVerification"
import EmailIcon from "@mui/icons-material/Email"
import ErrorIcon from "@mui/icons-material/Error"
import FacebookIcon from "@mui/icons-material/Facebook"
import GitHubIcon from "@mui/icons-material/GitHub"
import PendingIcon from "@mui/icons-material/Pending"
import TwitterIcon from "@mui/icons-material/Twitter"
import VerifiedIcon from "@mui/icons-material/Verified"
import YouTubeIcon from "@mui/icons-material/YouTube"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import React from "react"

import { GitLabIcon, TwitchIcon } from "~/components/icons"

const UserIdQuery = gql`
  query UserIdQuery($id: String!) {
    userId(id: $id) {
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

const Post = () => {
  const router = useRouter()
  const { userId } = router.query
  const { loading, error, data } = useQuery<{
    userId: {
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
  }>(UserIdQuery, {
    variables: { id: userId }
  })
  const [hash, setHash] = useState<string>("")
  useEffect(() => {
    setHash(router.asPath.split("#")[1])
  }, [router.asPath])

  if (data) {
    return (
      <>
        <title>Inspect Account</title>
        {data.userId ? (
          <>
            <style jsx>{`
              h2 {
                display: flex;
                align-items: center;
                vertical-align: middle;
                font-family: sans-serif;
              }
              ul {
                list-style: none;
                padding-left: 3em;
              }
              li {
                display: flex;
                align-items: center;
                vertical-align: middle;
                font-size: 1.2em;
                font-family: sans-serif;
                font-weight: bold;
              }
              img {
                width: 1.5em;
                height: 1.5em;
                border-radius: 50%;
                margin-right: 0.2em;
              }
              .icon {
                display: inline-block;
                border-radius: 30%;
                padding: 0.15em;
                width: 1.5em;
                height: 1.5em;
                margin-right: 0.2em;
              }
              a {
                color: white;
                text-decoration: none;
              }

              .google {
                background-color: #ff0000;
              }
              .twitter {
                background-color: #1da1f2;
              }
              .facebook {
                background-color: #4267b2;
              }
              .github {
                background-color: #161b22;
              }
              .gitlab {
                background-color: #fc6d26;
              }
              .twitch {
                background-color: #9146ff;
              }
            `}</style>
            {data.userId.accounts.map(({ profile }, i) =>
              profile ? (
                <div key={i}>
                  <h2>
                    <div className={`icon ${profile.provider}`}>
                      {profile.provider == "google" ? (
                        <YouTubeIcon
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            fontSize: "unset"
                          }}
                        />
                      ) : profile.provider == "twitter" ? (
                        <TwitterIcon
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            fontSize: "unset"
                          }}
                        />
                      ) : profile.provider == "facebook" ? (
                        <FacebookIcon
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            fontSize: "unset"
                          }}
                        />
                      ) : profile.provider == "github" ? (
                        <GitHubIcon
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            fontSize: "unset"
                          }}
                        />
                      ) : profile.provider == "gitlab" ? (
                        <GitLabIcon
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            fontSize: "unset"
                          }}
                        />
                      ) : profile.provider == "twitch" ? (
                        <TwitchIcon
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            fontSize: "unset"
                          }}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                    <img src={profile.image} />
                    {profile.username}
                  </h2>
                  <ul>
                    {profile.follower ? (
                      <li>
                        <VerifiedIcon
                          style={{
                            width: "0.9em",
                            height: "0.9em",
                            fontSize: "unset",
                            marginRight: "0.2em"
                          }}
                        />
                        Follower Count
                      </li>
                    ) : (
                      <></>
                    )}
                  </ul>
                </div>
              ) : (
                <></>
              )
            )}
            {data.userId.emails.length > 0 ? (
              <div>
                <h2>
                  <div className="icon email">
                    <EmailIcon
                      style={{
                        width: "1.5em",
                        height: "1.5em",
                        fontSize: "unset"
                      }}
                    />
                  </div>
                  Email
                </h2>
                <ul>
                  {data.userId.emails.map((e, i) => (
                    <li key={i}>
                      <a href={"mailto:" + e.email}>
                        <VerifiedIcon
                          style={{
                            width: "0.9em",
                            height: "0.9em",
                            fill: e.verified ? "white" : "grey",
                            fontSize: "unset",
                            marginRight: "0.2em"
                          }}
                        />
                        {e.email}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <></>
            )}
            {data.userId.domains.length > 0 ? (
              <div>
                <h2>
                  <div className="icon domain">
                    <DomainIcon
                      style={{
                        width: "1.5em",
                        height: "1.5em",
                        fontSize: "unset"
                      }}
                    />
                  </div>
                  Domains
                </h2>
                <ul>
                  {data.userId.domains.map((e, i) => (
                    <li key={i}>
                      <a href={"https://" + e.domain}>
                        <VerifiedIcon
                          style={{
                            width: "0.9em",
                            height: "0.9em",
                            fill: e.verified ? "white" : "grey",
                            fontSize: "unset",
                            marginRight: "0.2em"
                          }}
                        />
                        {e.domain}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <></>
            )}
          </>
        ) : (
          <>
            <h1
              style={{
                textAlign: "center",
                fontFamily: "sans-serif"
              }}>
              404
            </h1>
            <h2
              style={{
                textAlign: "center",
                fontFamily: "sans-serif"
              }}>
              User not found.
            </h2>
          </>
        )}
      </>
    )
  } else return <></>
}

export default Post
