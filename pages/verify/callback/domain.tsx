import { gql, useQuery } from "@apollo/client"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Domain() {
  const { data: session } = useSession()
  const router = useRouter()
  const { identifier } = router.query

  if (session) {
    return (
      <>
        Create a txt record... <br />
        <pre>
          __unocheck.{identifier}
          <br />
          {
            //@ts-expect-error
            session.user.id
          }
        </pre>
        <Link href={"/api/verify/callback/domain?identifier=" + identifier}>
          verify
        </Link>
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
