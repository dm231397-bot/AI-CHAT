const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route (to confirm server works)
app.get("/", (req, res) => {
  res.send("✅ AI Backend is running...");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMessage
        })
      }
    );

    const data = await response.json();

    console.log("HF response:", data);

    if (data.error) {
      return res.json({ reply: "⚠️ AI error: " + data.error });
    }

    const reply = data[0]?.generated_text || "🤖 No response";

    res.json({ reply });

  } catch (error) {
    console.log(error);
    res.json({ reply: "❌ Server error" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
