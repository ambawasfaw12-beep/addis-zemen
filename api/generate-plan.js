// api/generate-plan.js
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, grade, subjects, days, hours, weak, goal } = req.body;

    const prompt = `
      You are an elite academic advisor at Addis Zemen Preparatory School in Ethiopia.
      Create a highly customized study plan for a student with these parameters:
      - Student Name: ${name}
      - Grade Level: ${grade}
      - Subjects to study: ${subjects ? subjects.join(', ') : 'General subjects'}
      - Plan Duration: ${days} days per week
      - Available Study Time: ${hours} hours per day
      - Target Focus/Weakness: ${weak || 'General review'}
      - Ultimate Academic Goal: ${goal}

      Return ONLY a clean JSON object with this exact structure (no markdown):
      {
        "planTitle": "Personalized Study Plan for ${name}",
        "summary": "Short encouraging message",
        "days": [
          {
            "day": "Day 1 - Monday",
            "tasks": ["Task 1", "Task 2", "Task 3"]
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let jsonText = response.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```json|```$/g, '').trim();
    }

    const parsedPlan = JSON.parse(jsonText);
    res.status(200).json(parsedPlan);

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate study plan. Please try again.' 
    });
  }
};