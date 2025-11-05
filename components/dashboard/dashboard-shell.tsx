"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { formatDistanceToNow } from "date-fns"
import {
  BarChart3,
  Bell,
  Clock,
  FileText,
  FolderOpen,
  Home,
  LifeBuoy,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Stethoscope,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"

const navigationItems = [
  { title: "Dashboard", icon: Home, href: "/dashboard" },
  { title: "New Case Setup", icon: Plus, href: "/dashboard/cases/new" },
  { title: "Active Cases", icon: FolderOpen, href: "/dashboard/cases" },
  { title: "Document Library", icon: FileText, href: "/dashboard/documents" },
  { title: "AI Assistant", icon: MessageCircle, href: "/dashboard/chat" },
  { title: "Chronology Templates", icon: Clock, href: "/dashboard/templates" },
  { title: "Analytics & Reports", icon: BarChart3, href: "/dashboard/analytics" },
  { title: "Support", icon: LifeBuoy, href: "/dashboard/support" },
  { title: "Settings & Billing", icon: Settings, href: "/dashboard/settings" },
]

const DISMISSED_NOTIFICATIONS_KEY = "medchrono_dismissed_notifications"

interface NotificationRecord {
  id: string
  title: string
  description: string
  created_at: string
  read_at?: string | null
  read?: boolean | null
}

interface DashboardShellProps {
  children: React.ReactNode
  user: User
  profile: Record<string, any> | null
}

const getNotificationCount = (notifications: NotificationRecord[]) => {
  return notifications.reduce((count, item) => {
    if (item.read === false) return count + 1
    if (item.read === null) return count + 1
    if (typeof item.read_at === "undefined") return count + 1
    return item.read_at ? count : count + 1
  }, 0)
}

export default function DashboardShell({ children, user, profile }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([])
  const dismissedNotificationsRef = useRef<string[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setDismissedNotificationIds(parsed.filter((item): item is string => typeof item === "string"))
        }
      }
    } catch (error) {
      console.warn("Unable to read dismissed notifications from storage:", error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(dismissedNotificationIds))
    } catch (error) {
      console.warn("Unable to persist dismissed notifications:", error)
    }
  }, [dismissedNotificationIds])

  useEffect(() => {
    dismissedNotificationsRef.current = dismissedNotificationIds
  }, [dismissedNotificationIds])

  useEffect(() => {
    setNotifications((current) =>
      current.filter((item) => !dismissedNotificationIds.includes(item.id)),
    )
  }, [dismissedNotificationIds])

  useEffect(() => {
    let isMounted = true

    const filterDismissed = (records: NotificationRecord[] | null | undefined) =>
      (records ?? []).filter((item) => !dismissedNotificationsRef.current.includes(item.id))

    const loadNotifications = async () => {
      setIsLoadingNotifications(true)
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, title, description, created_at, read_at, read")
          .order("created_at", { ascending: false })
          .limit(6)

        if (error) {
          throw error
        }

        if (isMounted) {
          setNotifications(filterDismissed(data))
        }
      } catch (error) {
        const errorCode = (error as { code?: string }).code
        const errorMessage = (error as { message?: string }).message ?? ""
        if (errorCode !== "PGRST205" && !errorMessage.includes("notifications")) {
          console.warn("Falling back to derived notifications:", error)
        }
        try {
          const { data: cases } = await supabase
            .from("cases")
            .select("id, case_name, updated_at, created_at")
            .order("updated_at", { ascending: false })
            .limit(6)

          if (isMounted && cases) {
            const derived = cases.map((caseItem) => ({
              id: `case-${caseItem.id}`,
              title: "Case activity",
              description: `${caseItem.case_name ?? "Case"} was recently updated`,
              created_at: caseItem.updated_at ?? caseItem.created_at ?? new Date().toISOString(),
              read: false,
            }))
            setNotifications(filterDismissed(derived))
          }
        } catch (fallbackError) {
          console.error("Unable to derive notifications:", fallbackError)
          if (isMounted) {
            setNotifications([])
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingNotifications(false)
        }
      }
    }

    void loadNotifications()

    const channel = supabase
      .channel("notifications-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          void loadNotifications()
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const dismissNotification = (id: string) => {
    setDismissedNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const handleNotificationSelect = (notification: NotificationRecord) => {
    dismissNotification(notification.id)

    if (notification.id.startsWith("case-")) {
      const caseId = notification.id.replace("case-", "")
      void router.push(`/dashboard/cases/${caseId}`)
      return
    }

    if (notification.id.startsWith("doc-")) {
      const documentId = notification.id.replace("doc-", "")
      void router.push(`/dashboard/documents/${documentId}`)
      return
    }

    const description = notification.description?.toLowerCase() ?? ""
    if (description.includes("document")) {
      void router.push("/dashboard/documents")
    } else {
      void router.push("/dashboard/cases")
    }
  }

  const handleClearNotifications = () => {
    setDismissedNotificationIds((prev) => [...new Set([...prev, ...notifications.map((item) => item.id)])])
    setNotifications([])
  }

  const unreadCount = getNotificationCount(notifications)
  const displayName = profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Account"

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r bg-white">
          <SidebarContent>
            <div className="flex items-center space-x-2 p-6 border-b">
              <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MedChronoAI</span>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive} className={isActive ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-600" : ""}>
                          <Link href={item.href}>
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="relative flex-1 max-w-xl">
                  <Input placeholder="Search cases, documents, or clients..." className="pl-10 w-full bg-gray-50 border-0" />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">
                        {isLoadingNotifications ? "Loading..." : `${notifications.length} updates`}
                      </Badge>
                    </DropdownMenuLabel>
                    {notifications.length === 0 ? (
                      <DropdownMenuItem disabled>No notifications yet</DropdownMenuItem>
                    ) : (
                      <>
                        {notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="flex flex-col items-start space-y-1"
                            onSelect={(event) => {
                              event.preventDefault()
                              handleNotificationSelect(notification)
                            }}
                          >
                            <span className="text-sm font-medium text-gray-900">{notification.title}</span>
                            <span className="text-xs text-gray-600">{notification.description}</span>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-xs text-gray-600" onSelect={(event) => {
                          event.preventDefault()
                          handleClearNotifications()
                        }}>
                          Clear all notifications
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName ?? "Account"} />
                        <AvatarFallback>{displayName?.slice(0, 2)?.toUpperCase() ?? "ME"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings?tab=billing">Billing</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/support">Support</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
