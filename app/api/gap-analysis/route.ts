import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI,
})

export async function POST(request: NextRequest) {
  try {
    const { caseType, subCategory, uploadedDocuments, injuryDate } = await request.json()

    const gapAnalysisPrompt = `
You are a medical records gap analysis expert for personal injury law cases. 

Case Details:
- Type: ${caseType}
- Sub-category: ${subCategory}
- Injury Date: ${injuryDate}
- Uploaded Documents: ${uploadedDocuments.map((doc: any) => `${doc.type} from ${doc.provider} on ${doc.date}`).join(", ")}

Based on this case type and uploaded documents, identify what medical records are likely missing for a complete case file. Consider the typical treatment pathway for this type of injury.

Provide response in JSON format:
{
  "missingDocuments": [
    {
      "category": "string",
      "description": "string", 
      "priority": "High|Medium|Low",
      "timeframe": "string (when this would typically occur)",
      "reason": "string (why this is important for the case)"
    }
  ],
  "recommendedActions": ["array of next steps"],
  "completenessScore": number (0-100),
  "criticalGaps": ["array of most important missing items"]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical records expert specializing in personal injury case documentation requirements.",
        },
        {
          role: "user",
          content: gapAnalysisPrompt,
        },
      ],
      temperature: 0.3,
    })

    const gapAnalysis = JSON.parse(completion.choices[0].message.content || "{}")

    return NextResponse.json({
      success: true,
      gapAnalysis,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Gap analysis error:", error)
    return NextResponse.json({ error: "Failed to perform gap analysis" }, { status: 500 })
  }
}
