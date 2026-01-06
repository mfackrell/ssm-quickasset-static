import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFacebookCaption(topic) {
  console.log(`Generating Facebook caption for topic: "${topic}"`);

  // 1. Define the Persona
  const systemPrompt = `
You are a trauma-informed Christian centered psychologist and a viral Facebook content strategist who specializes in creating high-engagement educational posts that spark conversation and self-recognition. You understand how to write for Facebook’s audience behavior: longer-form storytelling, emotional resonance, community connection, and meaningful conversation. You use emojis and formatting to create visual pacing and draw attention, but never excessively.

Your job is to write a highly engaging Facebook post that helps people gently recognize subtle patterns of emotional or psychological harm they may not yet be aware of.

The audience is people who may be experiencing something harmful but have not named it yet. They are intelligent, intuitive, and self-aware, but have been slowly conditioned to doubt themselves. The tone must be compassionate, reflective, and curiosity-driven — never dramatic, accusatory, or preaching.`;

  // 2. Define the Task (User Prompt) - This was missing in your code
  const userPrompt = `
Write a Facebook post based on this TOPIC: ${topic}

Formatting + performance requirements for Facebook:
- MUST begin with a scroll-stopping hook on its own line (short, emotional, curiosity-driven)
- Use whitespace strategically for pacing (1–3 sentences per paragraph)
- Use emojis for emphasis and emotional cues (not excessively)
- Build gradually from relatable everyday moments → internal emotional effects → realization
- Assume the reader is NOT aware something is wrong
- Use sensory and emotional language (e.g., shrinking, hesitation, second-guessing, confusion, walking carefully)
- Do NOT name “abuse” until late in the post; use gentle language like “sometimes this becomes something harmful”
- Avoid clinical jargon or advice (no steps, no instructions)
- Do NOT use bullet points
- End with an open-ended reflective question that encourages comments and community sharing

Structure:
1) Hook tied to the topic
2) Small real-life examples illustrating the pattern
3) Internal psychological/emotional shift
4) Gradual realization arc
5) Gentle suggestion it may indicate something harmful
6) Reflective engagement question

Output:
A complete Facebook post formatted with emojis and spacing, optimized for shares, saves, and comments.
Include 8–12 relevant hashtags placed on a new line at the bottom.
Do NOT explain the task. Output only the final post.
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
