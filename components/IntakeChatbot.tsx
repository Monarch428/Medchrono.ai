"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, Loader2, MessageCircle, Send, User } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const DEFAULT_SUGGESTIONS = [
  "I need to start a new case.",
  "I was injured in a recent accident.",
  "I'm seeking medical treatment updates.",
  "I have questions about my legal options.",
]

function extractMessageText(payload: unknown): string {
  if (!payload) return "I wasn't able to understand the response."

  if (typeof payload === "string") return payload

  const data = payload as Record<string, unknown>
  if (typeof data.bot_reply === "string") return data.bot_reply

  return JSON.stringify(payload, null, 2)
}

function extractSuggestedPrompts(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return []

  const data = payload as Record<string, unknown>
  const candidateKeys = ["suggestions", "follow_up", "questions", "next_questions", "follow_up_questions"]

  for (const key of candidateKeys) {
    const value = data[key]
    if (Array.isArray(value)) {
      const prompts = value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
      if (prompts.length > 0) {
        return prompts
      }
    }
  }

  return []
}

export function IntakeChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your client intake assistant. Share the details of your situation and I'll guide you through the questions we need for your case.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(DEFAULT_SUGGESTIONS)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversationHistory = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      })),
    [messages],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSendMessage = async (override?: string) => {
    const messageToSend = (override ?? input).trim()
    if (!messageToSend || isLoading) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({
        //   message: messageToSend,
        //   history: conversationHistory,
        // }),
        body: JSON.stringify({
        user_message: messageToSend,
        // session_id: optionalSessionId, // add later if needed
      }),

      })

      const text = await response.text()
      let data: unknown = null

      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = text
      }

      if (!response.ok) {
        const errorMessage = extractMessageText(data)
        throw new Error(errorMessage || `Request failed with status ${response.status}`)
      }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: extractMessageText(data),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const nextPrompts = extractSuggestedPrompts(data)
      if (nextPrompts.length > 0) {
        setSuggestedPrompts(nextPrompts)
      }
    } catch (error) {
      console.error("Intake chatbot error:", error)
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant-error`,
        role: "assistant",
        content:
          error instanceof Error
            ? `I ran into a problem contacting the intake service: ${error.message}`
            : "I ran into a problem contacting the intake service. Please try again in a moment.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void handleSendMessage()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void handleSendMessage()
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInput("")
    void handleSendMessage(prompt)
  }

  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-cyan-600" />
          Client Intake Assistant
        </CardTitle>
        <CardDescription>
          Capture client intent and case details through a guided, responsive conversation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col rounded-lg border bg-white/60">
          <ScrollArea className="h-72 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse text-right" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      message.role === "user" ? "bg-cyan-600" : "bg-gray-100"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-cyan-600 text-white"
                        : "bg-white text-gray-900 border border-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-gray-400">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <Bot className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="border-t bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your situation or ask a question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="bg-cyan-600 hover:bg-cyan-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Press Enter to send. Shift + Enter to add a new line.</p>
          </form>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Suggested prompts</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-cyan-100 bg-white text-xs text-cyan-700 hover:bg-cyan-50"
                onClick={() => handlePromptClick(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </Button>
            ))}
            {suggestedPrompts.length === 0 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                Suggestions will appear as you chat
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default IntakeChatbot
