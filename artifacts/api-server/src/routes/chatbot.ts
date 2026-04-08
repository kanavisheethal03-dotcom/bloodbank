import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `You are MedAssist AI, a helpful and supportive medical assistant AI for the Blood Bank Management System. 
Your goal is to help users understand possible diseases or conditions based on the symptoms they describe.
When a user provides symptoms:
1. List 2-3 possible conditions that match the symptoms (e.g., Malaria, Flu, Dengue).
2. For each condition, give a very brief explanation.
3. Suggest general home care if applicable (like rest, hydration).
4. ALWAYS conclude with a clear medical disclaimer that you are an AI, this is for informational purposes only, and they should consult a doctor for a real diagnosis.
Please keep your responses concise, structured, and easy to read. Do not use markdown that is too complex, simple bold/lists are fine.`;

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === "your_hugging_face_token_here") {
      res.status(500).json({ error: "Hugging Face API key is missing. Please add your real key to the .env file." });
      return;
    }

    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: formattedMessages,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hugging Face API Error: ${response.status} - ${errText}`);
    }

    const data: any = await response.json();

    res.json({
      message: data.choices[0].message.content
    });

  } catch (error: any) {
    req.log.error(error, "Hugging Face API Error");
    res.status(500).json({ error: "Failed to generate medical response", details: error.message });
  }
});

export default router;
