import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"

export default function Index() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.name} <br />
        <Link href="/verify/domain">
          <button>Domain</button>
        </Link>
        <Link href="/verify/email">
          <button>Email</button>
        </Link>
        <button onClick={() => signIn()}>Link</button>
        <button onClick={() => signOut()}>Sign out</button>
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
