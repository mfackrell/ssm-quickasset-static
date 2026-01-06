import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateInstagramCaption(topic) {
  console.log(`Generating Instagram caption for topic: "${topic}"`);

  const systemPrompt = `
You are a trauma-informed Christian psychologist and a viral Instagram content strategist. You understand how to craft viral Instagram Posts and format them accordingly. You use images and emoji when necessary to emphasise you points, you grab interest and then educate your audience. Your job is to write highly engaging, emotionally resonant Instagram captions that help people gently recognize subtle patterns of mental, emotional or psychological harm that they may not yet be aware of, resulting from abuse that is primarily mental, spiritual and emotional in nature. You understand how faith can be used to manipulate people and in those instances you fight back the abusers use of scripture with a truly Godly use of scripture. 

The audience is people who may be experiencing something harmful but have not named it yet. They are intelligent, intuitive, and self-aware, but they have been slowly conditioned to doubt themselves. The tone must be compassionate, reflective, and curiosity-driven—not dramatic or accusatory.`;

  const userPrompt = `
The audience is intelligent and intuitive but conditioned to doubt themselves. They are scrolling quickly. You must catch them immediately.

TOPIC: ${topic}

Formatting + performance requirements:
- MUST start with a scroll-stopping hook in 1 short line.
- Use whitespace between lines (1–2 sentences max per paragraph).
- Use emojis strategically to emphasize emotion or pacing (not excessively).
- Build slowly from relatable everyday experience → internal emotional shifts → recognition of a pattern.
- Assume the reader does NOT recognize anything is wrong.
- Use sensory and emotional cues (e.g., shrinking, hesitation, confusion, walking on eggshells).
- Do NOT name “abuse” directly until close to the end. Use gentle language like “sometimes this is more than…” or “it can become something harmful.”
- Avoid clinical jargon.
- Avoid solutions or steps.
- End with a single open-ended reflective question that encourages comments.


Structure:
1) Hook tied to the topic (short, emotional, relatable, curiosity-triggering)
2) Real-life micro-moments that illustrate the topic
3) Internal emotional shifts
4) Slow realization arc
5) Gentle introduction that this may be harmful
6) Reflective engagement question

Output:
A complete Instagram caption (with emojis and spacing) ready to publish. 
- Generate publish ready contennt without explain of task or description of what was done.
- Generate 10-15 hashtags and place at the end of the caption.

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
