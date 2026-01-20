import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

try {
  console.log('Attempting to list available models...');
  const models = await genAI.listModels();
  console.log('\nAvailable models:');
  for await (const model of models) {
    console.log(`- ${model.name}`);
    console.log(`  Display name: ${model.displayName}`);
    console.log(`  Input token limit: ${model.inputTokenLimit}`);
    console.log(`  Output token limit: ${model.outputTokenLimit}`);
    console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
    console.log('');
  }
} catch (error) {
  console.error('Error listing models:', error.message);
  process.exit(1);
}
