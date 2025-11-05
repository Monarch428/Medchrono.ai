import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import DashboardShell from "@/components/dashboard/dashboard-shell"
import { getSupabaseServerClient } from "@/lib/supabase/server"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  let profile: Record<string, any> | null = null

  try {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).maybeSingle()
    if (error) {
      console.error("Failed to fetch user profile:", error.message)
    } else {
      profile = data
    }
  } catch (error) {
    console.error("Unexpected error loading profile:", error)
  }

  return <DashboardShell user={session.user} profile={profile}>{children}</DashboardShell>
}
