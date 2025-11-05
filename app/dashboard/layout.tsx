import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import DashboardShell from "@/components/dashboard/dashboard-shell"
import { getSupabaseServerClient } from "@/lib/supabase/server"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  let profile: Record<string, any> | null = null

  try {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()
    if (error) {
      console.error("Failed to fetch user profile:", error.message)
    } else {
      profile = data
    }
  } catch (error) {
    console.error("Unexpected error loading profile:", error)
  }

  return <DashboardShell user={user} profile={profile}>{children}</DashboardShell>
}
