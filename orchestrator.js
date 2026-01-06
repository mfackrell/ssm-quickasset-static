import { selectTopic } from "./steps/selectTopic.js";
import { generateInstagramCaption } from "./steps/generateInstagramCaption.js";
import { generateFacebookCaption } from "./steps/generateFacebookCaption.js"; // Fixed import style
import { generatePinterestCaption } from "./steps/generatePinterestCaption.js"; // <--- New Import
import { generateFacebookImage } from "./steps/generateFacebookImage.js";
import { generateInstagramImage } from "./steps/generateInstagramImage.js";
import { generatePinterestImage } from "./steps/generatePinterestImage.js";
import { triggerZapier } from "./steps/triggerZapier.js"; // <--- New Import

export async function runOrchestrator(payload = {}) {
  console.log("SSM Orchestrator started", { timestamp: new Date().toISOString() });

  try {
    // --- STEP 1: Topic Selection ---
    const topic = await selectTopic();
    console.log(`Topic Selected: "${topic}"`);

    // --- STEP 2: Content Generation (Concurrent) ---
    // Note: We pass 'topic' only. The functions handle their own OpenAI instances.
    const [fbText, igText, pinData] = await Promise.all([
      generateFacebookCaption(topic),
      generateInstagramCaption(topic),
      generatePinterestCaption(topic)
    ]);

    console.log("Content generated successfully.");

    // --- STEP 3: Image Generation (Concurrent) ---
    // We pass the generated TEXT to the image generators so they can extract headlines
    console.log("Starting Image Generation...");
    const [fbImageUrl, igImageUrl, pinImageUrl] = await Promise.all([
      generateFacebookImage(fbText),
      generateInstagramImage(igText),
      generatePinterestImage(pinData) // Passing the object {title, caption}
    ]);
    console.log("Image Generation Complete.");

    // --- STEP 4: Zapier Trigger (New Functionality) ---
    // DEFINITION ADDED HERE to fix ReferenceError
    const zapierPayload = {
      "IG Image URL": igImageUrl,
      "IG Caption": igText,
      "FB ImageURL": fbImageUrl,
      "FB Description": fbText,
      "Pinterest Image Url": pinImageUrl,
      "Pinterst Title": pinData.title,
      "Pinterest Description": pinData.caption
    };
    
    await triggerZapier(zapierPayload);

    return {
      status: "completed",
      topic: topic,
      facebook: {
        text: fbText,
        imageUrl: fbImageUrl
      },
      instagram: {
        text: igText,
        imageUrl: igImageUrl
      },
      pinterest: {
        title: pinData.title,
        text: pinData.caption,
        imageUrl: pinImageUrl
      }
    };

  } catch (error) {
    console.error("Orchestrator failed:", error);
    throw error;
  }
}
