import { GoogleGenAI } from "@google/genai";
import { uploadToGCS } from "../helpers/uploadToGCS.js";
import { extractHeadline } from "../helpers/extractHeadline.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateInstagramImage(caption) {
  const key = "Instagram Image";
  console.log(`Starting ${key} Generation...`);

  const headline = await extractHeadline(caption, "Instagram");
  
  const timer = setInterval(() => {
    console.log(`...still waiting for Gemini Image API on ${key} (30s elapsed)...`);
  }, 30000);

  try {
    const prompt = `
Create a vertical Instagram graphic (1080x1350).
YOUR TASK:
Create a sophisticated, minimalist typographic poster using the INPUT HEADLINE as the central visual element.

DESIGN ETHOS: "Clarity is power."
The aesthetic should feel like a clean, organized digital workspace. It should breathe relief and simplicity.

VISUAL CONSTRAINTS:
- Typography: Use a clean, modern, bold sans-serif font. The headline must be instantly readable. Typography is the hero.
- Background: Use subtle digital textures. Think clean grids, faint blueprint lines, abstract representations of file folders, or smooth, calming gradients (e.g., deep charcoal to muted teal, off-white to light grey).
- Color Palette: "Premium Utility." Use sophisticated tech colors—deep blues, forest greens, slate greys, or muted metallics. No neon, no aggressive reds, no chaotic colors.
- Composition: Use ample whitespace to create a feeling of calm organization.

NEGATIVE CONSTRAINTS (CRITICAL):
- NO stock photos of people, computers, or desks.
- NO cheesy icons (lightbulbs, gears, dollar signs).
- NO "grunge," "distressed," or chaotic textures.
- NO aggressive or shouting aesthetics.

The final image should look like a high-end digital artifact that stops the scroll because of how clean it is, not how loud it is.
TEXT TO RENDER: "${headline}"
`;

    const config = {
      imageConfig: {
        aspectRatio: "3:4", // Instagram Vertical
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

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: config
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
      throw new Error(`No image generated for ${key}.`);
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const filename = `ig_img_${Date.now()}.png`;

    return await uploadToGCS(imageBuffer, filename);

  } catch (error) {
    console.error(`Failed to generate ${key}:`, error);
    throw error;
  } finally {
    clearInterval(timer);
  }
}
