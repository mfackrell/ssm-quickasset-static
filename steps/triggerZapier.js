export async function triggerZapier(payload) {
  console.log("Triggering Zapier Webhook...");
  const webhookUrl = "https://hooks.zapier.com/hooks/catch/19867794/uwg3zew/";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Zapier returned status: ${response.status}`);
    }

    console.log("✅ Zapier webhook triggered successfully.");
    return { success: true };

  } catch (error) {
    // Log error but don't break the entire orchestrator flow
    console.error("❌ Failed to trigger Zapier:", error.message);
    return { success: false, error: error.message };
  }
}
