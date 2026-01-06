import { GoogleGenAI } from "@google/genai";
import { uploadToGCS } from "../helpers/uploadToGCS.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generatePinterestImage(pinterestData) {
  const key = "Pinterest Image";
  console.log(`Starting ${key} Generation...`);
  
  const textOverlay = pinterestData.title || "Subtle Recognition"; 

  const timer = setInterval(() => {
    console.log(`...still waiting for Gemini Image API on ${key} (30s elapsed)...`);
  }, 30000);

  try {
    const prompt = `
Create a Pinterest graphic (1080x1920).
YOUR TASK:
Create a sophisticated, minimalist typographic poster using the INPUT HEADLINE as the central visual element.

DESIGN ETHOS: "Digital Clarity."
The graphic should feel like the cover of a valuable, organized digital file or template. It needs to look professional and "save-worthy" because of its utility, not its vibes.

VISUAL CONSTRAINTS:
- Typography: Use a clean, modern, bold sans-serif font. The headline must be instantly readable.
- Background: Use subtle digital textures that suggest organization. Think clean grids, faint technical lines, abstract representations of file folders, or smooth, professional gradients (e.g., slate grey to muted blue, deep forest green to charcoal).
- Color Palette: "Premium Utility." Use sophisticated tech colors. No loud, aggressive colors.
- Composition: Use ample whitespace. The design should feel uncluttered and expensive.

NEGATIVE CONSTRAINTS (CRITICAL):
- NO stock photos of people, laptops, coffee cups, or plants.
- NO cheesy icons (lightbulbs, gears, dollar signs).
- NO "soft aesthetic" or "lifestyle" vibes.
- NO aggressive or chaotic textures.

The final image should look like a high-end digital artifact that stops the scroll because of how clean and valuable it looks.
TEXT TO RENDER: "${textOverlay}"
`;

    const config = {
      imageConfig: {
        aspectRatio: "9:16", // Pinterest Tall
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
    const filename = `pin_img_${Date.now()}.png`;

    return await uploadToGCS(imageBuffer, filename);

  } catch (error) {
    console.error(`Failed to generate ${key}:`, error);
    throw error;
  } finally {
    clearInterval(timer);
  }
}
