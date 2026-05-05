import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/bigscience/bloom-560m",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMessage
        })
      }
    );

    const text = await response.text();
    console.log("RAW:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.json({
        reply: "❌ HuggingFace returned HTML (bad request or key)"
      });
    }

    if (data.error) {
      return res.json({
        reply: "⏳ AI is loading... try again"
      });
    }

    res.json({
      reply: data[0]?.generated_text || "No response"
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.json({ reply: "❌ Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("AI backend is running 🚀");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
