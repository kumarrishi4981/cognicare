import { GoogleGenerativeAI } from '@google/generative-ai';

/** @type {GoogleGenerativeAI | null} */
let genAI = null;

/**
 * Get or initialize the Gemini AI client.
 * @returns {GoogleGenerativeAI}
 */
function getGenAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Build the system prompt using patient profile data.
 * @param {Object} profile - PatientProfile document
 * @returns {string} System instruction text
 */
function buildSystemPrompt(profile) {
  const name = profile?.preferredName || 'the patient';
  const now = new Date();

  let prompt = `You are a warm, patient, and gentle companion for ${name}. `;
  prompt += `You are speaking with someone who has dementia. `;
  prompt += `\n\nKey rules:\n`;
  prompt += `- Always be patient with repeated questions — never point out that they've asked before.\n`;
  prompt += `- Never show frustration or impatience.\n`;
  prompt += `- Use simple, clear language. Keep sentences short.\n`;
  prompt += `- Always be reassuring and kind.\n`;
  prompt += `- Refer to their family members by name when relevant.\n`;
  prompt += `- If they seem confused or upset, gently redirect to a comforting topic.\n`;
  prompt += `- Do not provide medical advice. If they report feeling unwell, gently suggest they talk to their caregiver.\n`;

  // Inject family member information
  if (profile?.familyMembers && profile.familyMembers.length > 0) {
    prompt += `\nFamily members:\n`;
    for (const member of profile.familyMembers) {
      prompt += `- ${member.name} (${member.relation})\n`;
    }
  }

  // Inject key facts
  if (profile?.keyFacts && profile.keyFacts.length > 0) {
    prompt += `\nImportant things to know about ${name}:\n`;
    for (const fact of profile.keyFacts) {
      prompt += `- ${fact}\n`;
    }
  }

  // Inject emergency contacts
  if (profile?.emergencyContacts && profile.emergencyContacts.length > 0) {
    prompt += `\nEmergency contacts (mention only if they ask for help):\n`;
    for (const contact of profile.emergencyContacts) {
      prompt += `- ${contact.name} (${contact.relation}): ${contact.phone}\n`;
    }
  }

  // Current date/time context
  prompt += `\nCurrent date and time: ${now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} at ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}.\n`;

  return prompt;
}

/**
 * Chat with the AI companion using Google Gemini.
 *
 * @param {string} userMessage - The patient's message
 * @param {Object} patientProfile - The PatientProfile document
 * @param {Array<{role: string, content: string}>} conversationHistory - Previous messages
 * @returns {Promise<string>} The AI response text
 */
async function chatWithCompanion(userMessage, patientProfile, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    // Local rule-based fallback mode to keep the application fully testable and functional
    const name = patientProfile?.preferredName || 'my friend';
    const msgLower = userMessage.toLowerCase();

    if (msgLower.includes('day') || msgLower.includes('date') || msgLower.includes('today')) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return `Today is ${dateStr}. It's currently ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}.`;
    }

    if (msgLower.includes('family') || msgLower.includes('son') || msgLower.includes('daughter') || msgLower.includes('wife') || msgLower.includes('husband') || msgLower.includes('who is')) {
      if (patientProfile?.familyMembers && patientProfile.familyMembers.length > 0) {
        const membersList = patientProfile.familyMembers.map(m => `${m.name} (your ${m.relation})`).join(', ');
        return `You have wonderful family members looking out for you: ${membersList}. They love you very much!`;
      }
      return `You have a loving family and care team. Ask your caregiver to add their names to your profile so I can remind you about them!`;
    }

    if (msgLower.includes('who are you') || msgLower.includes('your name') || msgLower.includes('companion') || msgLower.includes('hello') || msgLower.includes('hi')) {
      return `I am your CogniCare companion! I am here to chat, keep you company, and help you remember your daily routines and family.`;
    }

    if (msgLower.includes('do now') || msgLower.includes('routine') || msgLower.includes('todo') || msgLower.includes('schedule') || msgLower.includes('what should i do')) {
      return `Right now, we can check your daily routines to see what's next, look through your photos in Memory Lane, or just chat here!`;
    }

    // Default response indicating key configuration
    return `Hello ${name}! I hear you. (Note: The AI Companion is in test mode. To enable real Google Gemini conversations, please add your GEMINI_API_KEY to your server's .env file.)`;
  }

  // Real Gemini call
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(patientProfile),
  });

  // Build and clean alternating conversation history for Gemini (last 20 messages)
  const recentHistory = conversationHistory.slice(-20);
  const formattedHistory = [];
  let lastRole = null;
  for (const msg of recentHistory) {
    const role = msg.role === 'model' ? 'model' : 'user';
    if (role !== lastRole) {
      formattedHistory.push({
        role,
        parts: [{ text: msg.content }],
      });
      lastRole = role;
    }
  }

  // Start a chat session with history
  const chat = model.startChat({
    history: formattedHistory,
  });

  // Send the user's message and get response
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  const responseText = response.text();

  return responseText;
}

export { chatWithCompanion };
