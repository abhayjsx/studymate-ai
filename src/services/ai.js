/**
 * StudyMate AI — Gemma AI Service
 * Uses Google's Gemini API with the open-source Gemma model
 * to power all study assistance features.
 */

import { GoogleGenAI } from '@google/genai';

let aiClient = null;

/**
 * Initialize the AI client with a Gemini API key.
 * We use the Gemma model (open-source) via the Gemini API.
 */
export function initAI(apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

/**
 * Check if AI is initialized.
 */
export function isAIReady() {
  return aiClient !== null;
}

/**
 * The open-source Gemma model identifier.
 * Using gemma-3-27b-it for high-quality instruction following.
 */
const MODEL = 'gemma-3-27b-it';

/**
 * Generate a response from Gemma given a prompt.
 */
async function generate(prompt, systemInstruction = '') {
  if (!aiClient) {
    throw new Error('AI not initialized. Please enter your Gemini API key.');
  }

  const response = await aiClient.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || 'You are StudyMate AI, a helpful and knowledgeable study assistant powered by the open-source Gemma model. You help students learn effectively by providing clear, well-structured, and accurate explanations. Use markdown formatting for better readability.',
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  return response.text;
}

/**
 * Summarize a chapter or document text.
 */
export async function summarizeText(text) {
  const prompt = `Please provide a comprehensive yet concise summary of the following study material. 
Organize it with clear headings, key points, and important takeaways.
Use bullet points for easy scanning.

STUDY MATERIAL:
${text}`;

  return generate(prompt);
}

/**
 * Generate MCQs from text.
 */
export async function generateMCQs(text, count = 5) {
  const prompt = `Based on the following study material, generate exactly ${count} multiple-choice questions to test understanding.

For each question, provide:
1. The question
2. Four options (A, B, C, D)
3. The correct answer
4. A brief explanation of why that answer is correct

Format each question like this:
**Question X:** [question text]

A) [option]
B) [option]
C) [option]
D) [option]

**Correct Answer:** [letter]
**Explanation:** [brief explanation]

---

STUDY MATERIAL:
${text}`;

  return generate(prompt);
}

/**
 * Generate viva/oral exam questions from text.
 */
export async function generateVivaQuestions(text, count = 8) {
  const prompt = `Based on the following study material, generate ${count} viva voce (oral examination) questions that a professor might ask.

Include a mix of:
- Conceptual questions
- Application-based questions
- "Why" and "How" questions
- Questions that test deep understanding

For each question, also provide a suggested answer outline.

Format:
**Q1:** [question]
**Suggested Answer:** [answer outline]

---

STUDY MATERIAL:
${text}`;

  return generate(prompt);
}

/**
 * Explain a difficult topic from the text.
 */
export async function explainTopic(text, topic = '') {
  const prompt = topic
    ? `From the following study material, explain the topic "${topic}" in simple, easy-to-understand language. Use analogies, examples, and step-by-step breakdowns where helpful.

STUDY MATERIAL:
${text}`
    : `Identify the most complex or difficult concepts from the following study material and explain each one in simple, easy-to-understand language. Use analogies, examples, and step-by-step breakdowns.

STUDY MATERIAL:
${text}`;

  return generate(prompt);
}

/**
 * Create a revision plan based on the material.
 */
export async function createRevisionPlan(text) {
  const prompt = `Based on the following study material, create a structured revision plan.

The plan should include:
1. **Key Topics** to revise (prioritized by importance)
2. **Suggested Time Allocation** for each topic
3. **Active Recall Questions** for self-testing
4. **Quick Reference Notes** (formulas, definitions, key facts)
5. **Study Tips** specific to this material

Make it practical and actionable for a student preparing for exams.

STUDY MATERIAL:
${text}`;

  return generate(prompt);
}

/**
 * Answer a custom question about the study material.
 */
export async function askQuestion(text, question) {
  const prompt = `Based on the following study material, please answer this question thoroughly and clearly:

QUESTION: ${question}

STUDY MATERIAL:
${text}

Please provide a detailed, accurate answer based on the material. If the answer isn't fully covered in the material, mention that and provide what you know.`;

  return generate(prompt);
}

/**
 * General chat without document context.
 */
export async function chat(question) {
  return generate(question);
}
