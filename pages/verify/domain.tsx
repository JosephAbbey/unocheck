import { gql, useQuery } from "@apollo/client"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const DomainsQuery = gql`
  query DomainsQuery($id: String!) {
    domains(id: $id) {
      domain
      verified
    }
  }
`

export default function Domain() {
  const { data: session } = useSession()
  const router = useRouter()
  let { identifier } = router.query
  const { loading, error, data } = useQuery<{
    domains:
      | {
          domain: string
          verified: boolean
        }[]
      | null
  }>(DomainsQuery, {
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
        {data?.domains.map((domain, i) => (
          <div key={i}>
            {domain.domain}
            {!domain.verified ? (
              <Link href={"/api/verify/domain?identifier=" + domain.domain}>
                verify
              </Link>
            ) : (
              <></>
            )}
          </div>
        ))}
        <div>
          <input
            type="domain"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Link href={"/api/verify/domain?identifier=" + input}>verify</Link>
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
