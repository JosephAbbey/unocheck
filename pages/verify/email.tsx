import { gql, useQuery } from "@apollo/client"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const EmailsQuery = gql`
  query EmailsQuery($id: String!) {
    emails(id: $id) {
      email
      verified
    }
  }
`

export default function Email() {
  const { data: session } = useSession()
  const router = useRouter()
  let { identifier } = router.query
  const { loading, error, data } = useQuery<{
    emails:
      | {
          email: string
          verified: boolean
        }[]
      | null
  }>(EmailsQuery, {
    //@ts-expect-error
    variables: { id: session?.user?.id }
  })

  const [input, setInput] = useState<string>("")

  useEffect(() => {
    identifier instanceof Array && (identifier = identifier[0])
    identifier && setInput(identifier)
  }, [identifier])

  if (session) {
    return (
      <>
        {data?.emails.map((email, i) => (
          <div key={i}>
            {email.email}
            {!email.verified ? (
              <Link href={"/api/verify/email?identifier=" + email.email}>
                verify
              </Link>
            ) : (
              <></>
            )}
          </div>
        ))}
        <div>
          <input
            type="email"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Link href={"/api/verify/email?identifier=" + input}>verify</Link>
        </div>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}
