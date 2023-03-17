import { gql, useQuery } from "@apollo/client"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

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
        <div></div>
        <pre>{JSON.stringify(data.userId, undefined, 2)}</pre>
      </>
    )
  } else return <></>
}

export default Post
