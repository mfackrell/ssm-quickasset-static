import { GoogleGenAI } from "@google/genai";
import { uploadToGCS } from "../helpers/uploadToGCS.js";
import { extractHeadline } from "../helpers/extractHeadline.js";

// Initialize the SDK
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateFacebookImage(caption) {
  const key = "Facebook Image";
  console.log(`Starting ${key} Generation...`);

  // 1. Text extraction
  const headline = await extractHeadline(caption, "Facebook");
  console.log(`Headline for FB: "${headline}"`);

  // 2. Setup Timer
  const timer = setInterval(() => {
    console.log(`...still waiting for Gemini Image API on ${key} (30s elapsed)...`);
  }, 30000);

  try {
    const prompt = `
Create a powerful, share-worthy Facebook graphic (1200x1350).
YOUR TASK:
Create a sophisticated, minimalist typographic poster using the INPUT HEADLINE as the central visual element.

DESIGN ETHOS: "Clarity over emotion."
The aesthetic should feel like a clean, organized digital workspace or a sophisticated blueprint. It should communicate professional utility.

VISUAL CONSTRAINTS:
- Typography: Use a clean, modern, bold sans-serif font. The headline must be the dominant visual feature.
- Background: Use subtle digital textures that suggest organization. Think clean grids, faint technical lines, abstract representations of file structures, or smooth, professional gradients (e.g., slate grey to muted blue, deep forest green to charcoal).
- Color Palette: "Premium Utility." Use sophisticated tech colors. No loud, aggressive, or "hustle" colors (like bright reds or neon yellows).
- Composition: Use ample whitespace. The design should feel uncluttered and expensive.

NEGATIVE CONSTRAINTS (CRITICAL):
- NO stock photos of people, laptops, coffee cups, or desks.
- NO cheesy emotional imagery or "inspirational" vibes.
- NO aggressive or chaotic aesthetics.

The final image should stop the scroll because it looks like a highly valuable piece of professional software, not a motivational quote.
TEXT TO RENDER ON IMAGE: "${headline}"
`;

    const textPart = { text: prompt };

    // 3. Configuration (Matches your reference architecture)
    const config = {
      imageConfig: {
        aspectRatio: "1:1", // Facebook Square
      },
      responseModalities: ["IMAGE"],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" }
      ],
      temperature: 0.7
    };

    // 4. SDK Call
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [{ role: "user", parts: [textPart] }],
      config: config
    });

    // 5. Response Handling
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
      throw new Error(`No image generated for ${key}. Response: ${JSON.stringify(response)}`);
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const filename = `fb_img_${Date.now()}.png`;

    // 6. Upload
    return await uploadToGCS(imageBuffer, filename);

  } catch (error) {
    console.error(`Failed to generate ${key}:`, error);
    throw error;
  } finally {
    clearInterval(timer);
  }
}
