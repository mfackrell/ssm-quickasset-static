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
Style: Elegant, modern typography, minimalist, warm palette (sands, charcoal, cream).
Mood: Grounding, reflective, safe.
NO people, NO clips arts.

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
