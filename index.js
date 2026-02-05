import 'dotenv/config'; 
import express from "express";
import { runOrchestrator } from "./orchestrator.js";

const app = express();
app.use(express.json());

// allow long processing but don't block scheduler
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
  console.log("Trigger received", { timestamp: new Date().toISOString() });

  // immediately acknowledge
  res.status(200).json({ status: "accepted" });

  // background execution
  (async () => {
    try {
      await runOrchestrator(req.body);
      console.log("Run completed");
    } catch (error) {
      console.error("Background run failed:", error);
    }
  })();
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
