const express = require("express");
const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt requerido" });
    }

    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2-image-latest",
        prompt: prompt.trim(),
        n: 1,
      }),
    });

    // Manejo detallado para ver el error EXACTO de xAI
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {}
      console.error("ERROR xAI API STATUS:", response.status);
      console.error("ERROR xAI API DETAILS:", errorData);
      return res.status(response.status).json({
        error: "Error de xAI API",
        details: errorData,
      });
    }

    const data = await response.json();
    const url = data?.data?.[0]?.url;

    if (!url) {
      return res.status(500).json({ error: "No se recibió URL de imagen de xAI" });
    }

    res.json({ imageUrl: url });
  } catch (err) {
    console.error("ERROR GENERAL:", err);
    res.status(500).json({
      error: "Fallo inesperado al generar imagen",
      details: err.message,
    });
  }
});

module.exports = router;
