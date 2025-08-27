import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, caseId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured")
      return NextResponse.json({ error: "AI service not configured. Please check OpenAI API key." }, { status: 500 })
    }

    // Search through documents and case data
    const searchResults = await searchDocuments(message, caseId)

    // Generate response using OpenAI with retrieved context
    const response = await generateRAGResponse(message, searchResults)

    return NextResponse.json({
      response,
      sources: searchResults.map((result) => ({
        filename: result.filename,
        relevance: result.relevance,
      })),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ error: `Failed to process chat message: ${errorMessage}` }, { status: 500 })
  }
}

async function searchDocuments(query: string, caseId?: string) {
  try {
    let searchQuery = supabaseAdmin.from("documents").select("*").not("extracted_text", "is", null)

    if (caseId) {
      searchQuery = searchQuery.eq("case_id", caseId)
    }

    const { data: documents, error } = await searchQuery

    if (error) {
      console.error("Document search error:", error)
      return []
    }

    // Simple text search - in production, you'd use vector embeddings
    const relevantDocs =
      documents?.filter((doc) => {
        const text = doc.extracted_text?.toLowerCase() || ""
        const keyFindings = JSON.stringify(doc.key_findings || {}).toLowerCase()
        const searchTerms = query.toLowerCase().split(" ")

        return searchTerms.some((term) => text.includes(term) || keyFindings.includes(term))
      }) || []

    // Score relevance based on keyword matches
    return relevantDocs
      .map((doc) => ({
        ...doc,
        relevance: calculateRelevance(query, doc),
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}

function calculateRelevance(query: string, document: any): number {
  const searchTerms = query.toLowerCase().split(" ")
  const text = (document.extracted_text || "").toLowerCase()
  const keyFindings = JSON.stringify(document.key_findings || {}).toLowerCase()

  let score = 0
  searchTerms.forEach((term) => {
    const textMatches = (text.match(new RegExp(term, "g")) || []).length
    const findingsMatches = (keyFindings.match(new RegExp(term, "g")) || []).length
    score += textMatches + findingsMatches * 2 // Weight key findings higher
  })

  return score
}

async function generateRAGResponse(query: string, documents: any[]) {
  try {
    const context = documents
      .map(
        (doc) => `
Document: ${doc.filename}
Key Findings: ${JSON.stringify(doc.key_findings, null, 2)}
Timeline Events: ${JSON.stringify(doc.timeline_events, null, 2)}
Extracted Text: ${doc.extracted_text?.substring(0, 1000)}...
---
`,
      )
      .join("\n")

    const systemPrompt = `You are a medical chronology AI assistant for personal injury law cases. You have access to medical documents and case information. 

Your role is to:
- Answer questions about medical records, treatments, and case details
- Provide chronological summaries of medical events
- Identify key medical findings and their significance
- Help with case analysis and documentation
- Always cite specific documents when providing information

Context from relevant documents:
${context}

Guidelines:
- Be precise and factual
- Always reference the source document
- Focus on medical and legal relevance
- If information isn't in the provided context, say so clearly
- Use professional medical and legal terminology appropriately`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    return completion.choices[0]?.message?.content || "I apologize, but I was unable to generate a response."
  } catch (error) {
    console.error("OpenAI API error:", error)
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("OpenAI API key is invalid or missing")
      } else if (error.message.includes("quota")) {
        throw new Error("OpenAI API quota exceeded")
      } else if (error.message.includes("rate limit")) {
        throw new Error("OpenAI API rate limit exceeded. Please try again in a moment.")
      }
    }
    throw new Error("AI service temporarily unavailable. Please try again.")
  }
}
