import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFacebookCaption(topic) {
  console.log(`Generating Facebook caption for topic: "${topic}"`);

  // 1. Define the Persona
  const systemPrompt = `
You are a content strategist for QuickAsset.
You are writing a Facebook post based on the "Lighter, Not Louder" philosophy.
`;

  // 2. Define the Task (User Prompt) - This was missing in your code
  const userPrompt = `
  Topic: ${topic}
INPUT LINK: https://quickasset.vercel.app/

YOUR TASK:
1. Analyze the INPUT HEADLINE to identify the specific audience or asset implied (e.g., if it mentions "Lesson Plans," the audience is Teachers).
2. Write a post (100-200 words) that expands on that specific angle.

DIFFERENCES FROM INSTAGRAM:
- Since this is Facebook, you can be slightly more conversational/story-driven.
- Place the URL directly in the text at the end.

STRUCTURE:
1. The Hook: Open with a calm observation about the specific asset. (e.g., "The most valuable file on an Architect's hard drive isn't usually the final PDF. It's the library they built to get there.")
2. The Validation: Acknowledge that they are sitting on a "digital tool" they use every day to save time. It wasn't built for "content"; it was built for survival.
3. The Solution: Remind them that other professionals are desperate for that exact tool.
4. The Permission: Tell them they can sell it right now without a website or a "launch strategy."
5. The Link: "Turn that file into a product here: [Insert Link]"

TONE & STYLE:
- "Lighter, not louder."
- No hype. No "Hustle." No "Grind."
- Use standard sentence case.
- Use calm emojis (📂, ☕️, ✨, 💡). Avoid "Hustle" emojis (🔥, 🚀, 💀, 😤).

HASHTAGS:
- Include ONLY 3-4 highly relevant hashtags at the very bottom. (Do not spam tags like on Instagram).

Output the post text with the link included.

OUTPUT FORMAT:
Write only the Facebook post, fully formatted with breaks, pacing, and emojis.
Nothing else.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }, // Now valid because userPrompt is defined
      ],
      temperature: 0.7, 
    });

    const caption = completion.choices[0].message.content;
    
    // --- LOGGING THE RESPONSE ---
    console.log("\n=== FACEBOOK RESPONSE START ===");
    console.log(caption);
    console.log("=== FACEBOOK RESPONSE END ===\n");
    // ----------------------------    
    return caption;

  } catch (error) {
    console.error("Error generating Facebook caption:", error);
    throw new Error("Failed to generate Facebook caption.");
  }
}
