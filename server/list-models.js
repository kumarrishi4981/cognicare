import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    let url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log("SUPPORTED MODEL NAMES:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log("No models returned:", data);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
