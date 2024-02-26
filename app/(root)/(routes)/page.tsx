import { UserButton } from "@clerk/nextjs"

const Page = () => {
  return (
    <div>
      <UserButton afterSignOutUrl="/" />
    </div>
  )
}

export default Page
