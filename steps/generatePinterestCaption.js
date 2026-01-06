import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePinterestCaption(topic) {
  console.log(`Generating Pinterest Title & Caption for topic: "${topic}"`);

  const systemPrompt = `
You are a trauma-informed Christian centered psychologist and viral Pinterest content strategist. Every Post is 450 characters or less. Any input you generate will be reviewed before the output to ensure it is under the 450 Character Limit.

you generate a publish ready description without discussion about what was completed or what you are doing.

You understand how Pinterest users consume content: visually, emotionally, and in short, powerful statements that are easy to save, share, and reflect on. You create content that sparks recognition and curiosity, without giving advice or naming the problem directly.

Your job is to write a brief, compelling Pinterest caption that gently helps people recognize subtle emotional and psychological harm that they may not yet be aware of. The tone should feel like a quiet realization — not a lecture.
You output JSON only.
Your goal is to create two distinct assets:
1. A **Pinterest Title**: High click-through rate, SEO-friendly, short (under 100 chars).
2. A **Pinterest Caption**: Emotional, reflective, under 450 characters.
`;

  const userPrompt = `
TOPIC: ${topic}

REQUIREMENTS:

1. **TITLE**: 
- Must be "Pinterest Friendly" (e.g., "5 Signs You...", "Why You Feel...", "The Hidden Pattern of...").
- Short, punchy, clear text overlay style.

2. **CAPTION**:
- **Strict Limit:** Under 450 characters total.
- **Structure:** - Hook (1-2 sentences).
  - Short reflection on internal shifts.
  - Gentle realization (don't name "abuse" until the end).
  - 1 Reflective Question.
- No "Title:" or labels inside the caption text.
- No step lists.

OUTPUT FORMAT (JSON):
{
  "title": "The generated title here",
  "caption": "The generated caption text here"
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }, // Forces structured output
      temperature: 0.7, 
    });

    // Parse the JSON string back into a JavaScript Object
    const responseData = JSON.parse(completion.choices[0].message.content);

    // --- LOGGING ---
    console.log("\n=== PINTEREST RESPONSE START ===");
    console.log("TITLE: " + responseData.title);
    console.log("CAPTION: " + responseData.caption);
    console.log("=== PINTEREST RESPONSE END ===\n");
    // --------------
    
    return responseData; // Returns { title, caption }

  } catch (error) {
    console.error("Error generating Pinterest content:", error);
    throw new Error("Failed to generate Pinterest content.");
  }
}
