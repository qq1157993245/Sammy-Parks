// components/SessionWrapper.tsx
"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export default function SessionWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider basePath="/driver/api/auth">
      {children}
    </SessionProvider>
  )
}
