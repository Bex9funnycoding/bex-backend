require("dotenv").config();
const express = require("express");
const cors = require("cors");

// IMPORTA EL ROUTER DE IMÁGENES
const imagesRouter = require("./routes/images");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// MONTAR RUTA DE IMÁGENES
app.use("/api/images", imagesRouter);

// ================== CHAT ==================
app.post("/api/chat", async (req, res) => {
  const { messages, userTier = "free" } = req.body;
  let model = "grok-4-fast-reasoning";
  if (["pro", "plus"].includes(userTier)) model = "grok-4";

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "No response";
    res.json({ response: content.trim() });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: "Chat backend error" });
  }
});

// ================== STATUS ==================
app.get("/", (req, res) => {
  res.json({ status: "BEX Backend online - Grok images ready 🚀" });
});

app.listen(PORT, () =>
  console.log(`🔥 BEX Backend running on port ${PORT}`)
);
