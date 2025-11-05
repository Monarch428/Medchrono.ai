"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Send, Bot, User, FileText, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  sources?: Array<{
    filename: string
    relevance: number
  }>
}

interface CaseData {
  id: string
  name: string
  client: string
}

export default function ChatPage() {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your AI assistant for medical chronology analysis. I can help you with questions about your cases, documents, and medical records. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCase, setSelectedCase] = useState<string>("all")
  const [cases, setCases] = useState<CaseData[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 🧠 Load cases from Supabase
  useEffect(() => {
    let isMounted = true

    const loadCases = async () => {
      try {
        const { data, error } = await supabase
          .from("cases")
          .select("id, case_name, client_name")
          .order("created_at", { ascending: false })

        if (error) throw error

        if (isMounted) {
          const normalized = (data ?? []).map((caseItem) => ({
            id: caseItem.id,
            name: caseItem.case_name ?? `Case ${caseItem.id.slice(0, 6)}`,
            client: caseItem.client_name ?? "—",
          }))
          setCases(normalized)
        }
      } catch (error) {
        console.error("Error loading cases:", error)
      }
    }

    void loadCases()

    const channel = supabase
      .channel("chat-cases-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, () => {
        void loadCases()
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // ✉️ Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ⌨️ Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 🚀 Handle sending messages
  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim()
    if (!trimmed) return

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: trimmed,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/intake/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          caseId: selectedCase === "all" ? null : selectedCase,
        }),
      })

      const data = await res.json()

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.reply ?? "I'm not sure about that, could you clarify?",
        role: "assistant",
        timestamp: new Date(),
        sources: data.sources ?? [],
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: "⚠️ Sorry, something went wrong. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // 🧩 UI
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-cyan-600" />
              <h1 className="text-2xl font-semibold text-gray-900">AI Assistant</h1>
            </div>
          </div>
          <Select value={selectedCase} onValueChange={setSelectedCase}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Select case context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cases &amp; documents</SelectItem>
              {cases.map((case_) => (
                <SelectItem key={case_.id} value={case_.id}>
                  {case_.name} - {case_.client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-0">
        <Card className="flex min-h-[520px] flex-col lg:min-h-[calc(100vh-260px)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-cyan-600" />
              <span>Medical Chronology AI Assistant</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Ask questions about your cases, documents, medical records, and chronologies.
            </p>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col p-0">
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse text-right" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={message.role === "user" ? "bg-cyan-100" : "bg-gray-100"}>
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-cyan-600" />
                        ) : (
                          <Bot className="h-4 w-4 text-gray-600" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex flex-1 flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-full rounded-lg px-3 py-2 text-left sm:px-4 sm:py-3 ${
                          message.role === "user"
                            ? "bg-cyan-600 text-white sm:ml-auto"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                      </div>

                      {message.sources && message.sources.length > 0 && (
                        <div
                          className={`mt-2 flex flex-wrap gap-2 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.sources.map((source, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs">
                              <FileText className="h-3 w-3" />
                              {source.filename}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className={`mt-1 text-xs text-gray-500 ${message.role === "user" ? "text-right" : ""}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-gray-100 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your cases, documents, or medical records..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || inputMessage.trim() === ""}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
