import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  try {
    console.log(`Testing model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello!");
    console.log(`✅ SUCCESS! Response: "${result.response.text().trim()}"`);
    return true;
  } catch (err) {
    console.error(`❌ FAILED: ${err.message}`);
    return false;
  }
}

async function run() {
  const models = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.0-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.0-flash'
  ];

  for (const m of models) {
    const ok = await testModel(m);
    if (ok) {
      console.log(`\n🎉 Found working model: ${m}`);
      process.exit(0);
    }
  }
  console.log("\n❌ All models failed.");
  process.exit(0);
}

run();
