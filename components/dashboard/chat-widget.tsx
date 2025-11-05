"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Bot, Loader2, MessageCircle, Send, Sparkles, User } from "lucide-react"

interface MessageRecord {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const DEFAULT_PROMPTS = [
  "Summarize the latest documents",
  "What should I review next?",
  "Draft a chronology intro",
]

const MAX_HISTORY = 12

export function DashboardChatWidget() {
  const [messages, setMessages] = useState<MessageRecord[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! I'm ready to help with medical chronologies, document insights, and next steps for your cases.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const trimmedHistory = useMemo(() => messages.slice(-MAX_HISTORY), [messages])

  const sendMessage = async (prompt?: string) => {
    const text = (prompt ?? input).trim()
    if (!text || isLoading) return

    const userMessage: MessageRecord = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setErrorNotice(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)

    try {
      const response = await fetch("/api/intake/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          (payload && (payload.error ?? payload.message)) ||
          `Request failed with status ${response.status}`
        throw new Error(message)
      }

      const payload = await response.json()
      const reply =
        payload.reply ?? payload.message ?? payload.bot_reply ?? payload.response ?? "I'm not sure, could you clarify?"

      const assistantMessage: MessageRecord = {
        id: `assistant-${crypto.randomUUID()}`,
        role: "assistant",
        content: typeof reply === "string" ? reply : JSON.stringify(reply),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev.slice(-MAX_HISTORY + 1), assistantMessage])
    } catch (error) {
      console.error("Dashboard assistant error:", error)
      const message =
        error instanceof Error
          ? error.name === "AbortError"
            ? "The assistant timed out while waiting for a response."
            : error.message
          : "Unknown error"

      setErrorNotice(message)
      const assistantMessage: MessageRecord = {
        id: `assistant-error-${crypto.randomUUID()}`,
        role: "assistant",
        content: "I ran into a problem reaching the assistant service. Please try again shortly.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev.slice(-MAX_HISTORY + 1), assistantMessage])
    } finally {
      clearTimeout(timeout)
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-cyan-600" />
              Chronology assistant
            </CardTitle>
            <CardDescription>Ask quick questions without leaving your dashboard.</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">
            Beta
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-1 flex-col space-y-3 pt-4">
        <ScrollArea className="h-[260px] pr-2">
          <div className="space-y-3">
            {trimmedHistory.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  {message.role === "assistant" ? (
                    <AvatarFallback className="bg-cyan-100 text-cyan-700">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{message.content}</p>
                  <p className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking through your request…
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {errorNotice && <p className="text-xs text-red-600">{errorNotice}</p>}

        <div className="grid gap-2 sm:grid-cols-3">
          {DEFAULT_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="justify-start text-left text-xs"
              onClick={() => void sendMessage(prompt)}
            >
              <MessageCircle className="mr-2 h-3.5 w-3.5" />
              {prompt}
            </Button>
          ))}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="pt-3">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about cases, documents, or chronology steps…"
            disabled={isLoading}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void sendMessage()
              }
            }}
          />
          <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <Button variant="ghost" size="sm" className="ml-2 text-xs" asChild>
          <Link href="/dashboard/chat">
            Open full assistant
            <Bot className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DashboardChatWidget
