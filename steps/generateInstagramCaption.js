import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateInstagramCaption(topic) {
  console.log(`Generating Instagram caption for topic: "${topic}"`);

  const systemPrompt = `
You are a content strategist for QuickAsset.
You are writing a caption for an Instagram Static Post based on the "Lighter, Not Louder" philosophy.
`;

  const userPrompt = `
The audience is intelligent and intuitive but conditioned to doubt themselves. They are scrolling quickly. You must catch them immediately.

TOPIC: ${topic}

YOUR TASK:
1. Analyze the INPUT HEADLINE to identify the specific audience or asset implied (e.g., if the headline mentions "CAD blocks," the audience is Architects).
2. Write a caption (100-150 words) that expands on that specific angle.

CAPTION STRUCTURE:
1. The Validation: Acknowledge that they created this specific file for themselves just to survive their own workload. It wasn't "content"; it was a tool.
2. The Shift: Point out that hundreds of people in their industry are struggling with the same problem, and they would happily pay $10-$20 for this solution.
3. The Relief: Remind them they don't need a website, a logo, or a "brand" to sell it. They just need a checkout link.
4. Soft CTA: "Link in bio to turn the file into a product in 60 seconds."

HASHTAG STRATEGY:
- Include 5 tags specific to the audience (e.g., #architecture, #revit, #designlife).
- Include 5 tags specific to the asset type (e.g., #cadblocks, #templates, #digitalassets).
- Include 5 tags about "calm business" (e.g., #passiveincome, #sidehustleideas, #quickasset, #sellfiles).
- Do NOT use spammy tags like #follow4follow or #like4like.

TONE & STYLE:
- "Lighter, not louder." Zero pressure.
- Calm, observational voice.
- Short, readable paragraphs.
- NO "Hustle Bro" emojis (No 🚀, 😤, 💀, 💰). Use calm emojis if necessary (📂, ✨, ☕️).
- NO hype language ("Explode your income," "Crush it," "Empire").

Output ONLY the caption text.

GENERATE NOW.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0, 
    });

    const caption = completion.choices[0].message.content;

    // --- LOGGING THE RESPONSE ---
    console.log("\n=== INSTAGRAM RESPONSE START ===");
    console.log(caption);
    console.log("=== INSTAGRAM RESPONSE END ===\n");
    // ----------------------------
    
    return caption;

  } catch (error) {
    console.error("Error generating Instagram caption:", error);
    throw new Error("Failed to generate Instagram caption.");
  }
}
