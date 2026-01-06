import 'dotenv/config'; 
import express from "express";
import { runOrchestrator } from "./orchestrator.js";
import { shouldRunToday, markRunComplete } from './helpers/stateManager.js';

const app = express();
app.use(express.json());

// Set timeout to 10 minutes to allow for image generation
app.use((req, res, next) => {
  res.setTimeout(600000, () => {
    console.log('Request has timed out.');
    if (!res.headersSent) res.sendStatus(408);
  });
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ssm-orchestrator", timestamp: new Date().toISOString() });
});

app.post("/run", async (req, res) => {
  console.log("Scheduler trigger received", { timestamp: new Date().toISOString() });

  try {
    const force = req.query.force === 'true';

    // --- SCHEDULING LOGIC ---
    if (!force) {
      const decision = await shouldRunToday();

      if (!decision.shouldRun) {
        console.log('Skipping run:', decision.reason);
        return res.status(200).json({
          status: 'skipped',
          reason: decision.reason,
          meta: decision
        });
      }
      console.log('Selected for execution! Running job now...');
    } else {
      console.log('Force flag detected. Bypassing schedule check.');
    }
    // ------------------------

    // Run the heavy lifting
    const result = await runOrchestrator(req.body);

    // ✅ Only mark complete AFTER success
    // If the orchestrator crashes, this line won't run, 
    // so the scheduler will try again in 15 minutes.
    await markRunComplete();

    res.status(200).json({
      status: "success",
      data: result
    });

  } catch (error) {
    console.error("Run failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
