import { ReactNode } from "react"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-full">{children}</div>
  )
}

export default Layout
