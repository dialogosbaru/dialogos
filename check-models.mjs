import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.argv[2];
if (!apiKey) {
  console.error("Usage: node check-models.mjs YOUR_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // Try different model names
    const modelsToTry = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash-exp",
      "models/gemini-pro",
      "models/gemini-1.5-flash"
    ];

    console.log("Testing available models...\n");

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = result.response.text();
        console.log(`✅ ${modelName}: WORKS`);
      } catch (error) {
        console.log(`❌ ${modelName}: ${error.message.split('\n')[0]}`);
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
