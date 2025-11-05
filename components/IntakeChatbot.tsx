"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, Loader2, MessageCircle, Send, User, X } from "lucide-react"

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
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        body: JSON.stringify({
          user_message: messageToSend,
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

  if (!isOpen) {
    return (
      <Button
        type="button"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-cyan-600 text-white shadow-lg hover:bg-cyan-700"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open intake assistant</span>
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 flex h-[600px] w-96 max-w-[calc(100vw-2rem)] flex-col shadow-2xl">
      <CardHeader className="flex-none border-b pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50">
              <MessageCircle className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Client Intake Assistant</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Capture client details through a guided, AI-driven conversation.
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close client intake assistant</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[85%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === "user" ? "bg-cyan-600" : "bg-gray-200"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-700" />
                )}
              </div>
              <div
                className={`rounded-lg p-3 text-sm shadow-sm ${
                  message.role === "user"
                    ? "bg-cyan-600 text-white"
                    : "bg-white text-gray-900 ring-1 ring-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p
                  className={`mt-2 text-[10px] uppercase tracking-wide ${
                    message.role === "user" ? "text-cyan-100" : "text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <Bot className="h-4 w-4 text-gray-700" />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="flex-none space-y-3 border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your situation or ask a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => void handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
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
        <p className="text-xs text-gray-500">Powered by AI. Responses are for intake assistance only.</p>
      </div>
    </Card>
  )
}

export default IntakeChatbot
