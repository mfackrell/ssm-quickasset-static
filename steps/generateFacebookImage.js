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
Purpose: Spark recognition of subtle emotional harm.
Design: Minimalist, premium typography, clean layout, warm muted colors (slate, navy, sand).
NO photos of people, NO cliches, NO chaotic imagery.
Emotional Tone: Calm strength, clarity.

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
