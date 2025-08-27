"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, User, Bell, CreditCard, Shield, Building, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UserProfile {
  first_name: string
  last_name: string
  phone: string
}

interface FirmProfile {
  firm_name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone: string
  website: string
}

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  case_updates: boolean
  document_analysis: boolean
  settlement_alerts: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    phone: "",
  })
  const [firmProfile, setFirmProfile] = useState<FirmProfile>({
    firm_name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    website: "",
  })
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    case_updates: true,
    document_analysis: true,
    settlement_alerts: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [timezone, setTimezone] = useState("est")

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      // Load user profile
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setUserProfile(profile)
      }

      // Load firm profile
      const { data: firm } = await supabase.from("firm_profiles").select("*").eq("user_id", user.id).single()

      if (firm) {
        setFirmProfile(firm)
      }

      // Load notification preferences
      const { data: notifPrefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (notifPrefs) {
        setNotifications(notifPrefs)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        ...userProfile,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      alert("Profile saved successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error saving profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const saveFirm = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase.from("firm_profiles").upsert({
        user_id: user.id,
        ...firmProfile,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      alert("Firm information saved successfully!")
    } catch (error) {
      console.error("Error saving firm:", error)
      alert("Error saving firm information. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        ...notifications,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      alert("Notification preferences saved successfully!")
    } catch (error) {
      console.error("Error saving notifications:", error)
      alert("Error saving notification preferences. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">Settings & Billing</h1>
              <p className="text-gray-600 mt-1">Manage your account, preferences, and subscription</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="firm">Firm</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userProfile.first_name}
                      onChange={(e) => setUserProfile({ ...userProfile, first_name: e.target.value })}
                      placeholder="Enter your first name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userProfile.last_name}
                      onChange={(e) => setUserProfile({ ...userProfile, last_name: e.target.value })}
                      placeholder="Enter your last name"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={user?.email || ""} disabled className="mt-1 bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveProfile} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="firm" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Firm Information
                </CardTitle>
                <CardDescription>Manage your law firm details and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input
                    id="firmName"
                    value={firmProfile.firm_name}
                    onChange={(e) => setFirmProfile({ ...firmProfile, firm_name: e.target.value })}
                    placeholder="Enter your firm name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={firmProfile.address}
                    onChange={(e) => setFirmProfile({ ...firmProfile, address: e.target.value })}
                    placeholder="Enter your firm address"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={firmProfile.city}
                      onChange={(e) => setFirmProfile({ ...firmProfile, city: e.target.value })}
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={firmProfile.state}
                      onChange={(e) => setFirmProfile({ ...firmProfile, state: e.target.value })}
                      placeholder="State"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={firmProfile.zip_code}
                      onChange={(e) => setFirmProfile({ ...firmProfile, zip_code: e.target.value })}
                      placeholder="ZIP"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="firmPhone">Firm Phone</Label>
                  <Input
                    id="firmPhone"
                    value={firmProfile.phone}
                    onChange={(e) => setFirmProfile({ ...firmProfile, phone: e.target.value })}
                    placeholder="Enter firm phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={firmProfile.website}
                    onChange={(e) => setFirmProfile({ ...firmProfile, website: e.target.value })}
                    placeholder="https://yourfirm.com"
                    className="mt-1"
                  />
                </div>
                <Button onClick={saveFirm} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Case Updates</h4>
                    <p className="text-sm text-gray-600">Get notified about case progress</p>
                  </div>
                  <Switch
                    checked={notifications.case_updates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, case_updates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Document Analysis</h4>
                    <p className="text-sm text-gray-600">Alerts when document analysis is complete</p>
                  </div>
                  <Switch
                    checked={notifications.document_analysis}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, document_analysis: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Settlement Alerts</h4>
                    <p className="text-sm text-gray-600">Important settlement-related notifications</p>
                  </div>
                  <Switch
                    checked={notifications.settlement_alerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, settlement_alerts: checked })}
                  />
                </div>
                <Button onClick={saveNotifications} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Subscription & Billing
                </CardTitle>
                <CardDescription>Manage your subscription and payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-4">
                    You're currently on the free trial. Upgrade to unlock all features.
                  </p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">Choose a Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Change Password</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="Enter new password" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Confirm new password" className="mt-1" />
                    </div>
                    <Button className="bg-cyan-600 hover:bg-cyan-700">Update Password</Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Setup 2FA</Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">HIPAA Compliance</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">HIPAA Compliant</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your account meets all HIPAA compliance requirements for handling medical information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
