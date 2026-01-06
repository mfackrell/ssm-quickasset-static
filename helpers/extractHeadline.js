import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractHeadline(caption, platform) {
  const systemPrompt = `You are an expert editor. Extract a short, powerful text overlay (max 6-8 words) from the provided caption. It must be suitable for a ${platform} image. Return ONLY the text. No quotes.`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: caption },
    ],
  });

  return completion.choices[0].message.content.trim();
}
