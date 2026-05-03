import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

router.get("/motivation", async (req, res) => {
  try {
    const completed = parseInt((req.query["completed"] as string) ?? "0") || 0;

    const prompt =
      completed === 0
        ? "Write a warm, uplifting 1-2 sentence motivational message for someone who is about to start their daily habits. Be genuine and encouraging. Plain text only, no quotes."
        : `Write a celebratory 1-2 sentence motivational message for someone who just completed ${completed} habit${completed === 1 ? "" : "s"} today. Be enthusiastic. Plain text only, no quotes.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 200 },
    });

    const message =
      response.text?.trim() ??
      "Every habit you build today is a brick in the person you're becoming.";
    const date = new Date().toISOString().split("T")[0];

    res.json({ message, date });
  } catch (error) {
    req.log.error({ error }, "Failed to generate motivation message");
    res.json({
      message:
        "Every habit you build today is a brick in the person you're becoming.",
      date: new Date().toISOString().split("T")[0],
    });
  }
});

export default router;
