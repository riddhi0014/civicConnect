const dotenv = require('dotenv');
dotenv.config();

/**
 * AI Triage Service
 * Makes exactly ONE LLM API call to triage the complaint.
 * Returns strict JSON: { category, priority, summary, is_spam, department }
 * If the call fails or returns invalid JSON, falls back gracefully to priority=medium, summary=null.
 * AI never blocks filing.
 */
async function triageComplaint(title, description, categoryName = 'General') {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL_NAME || (provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini');

  // Fallback defaults in case AI is disabled, missing key, or encounters any error
  const fallback = {
    category: categoryName,
    priority: 'medium',
    summary: null,
    is_spam: false,
    department: null
  };

  // If user hasn't set an API key yet, return safe fallback immediately
  if (!apiKey || apiKey === 'your-gemini-or-openai-api-key') {
    console.log('ℹ️ AI API key not configured or using placeholder; using reliable fallback triage (medium priority).');
    return fallback;
  }

  const systemPrompt = `You are an automated municipal triage engine for city civic grievances.
Analyze the following civic complaint and return a STRICT JSON object with these EXACT keys:
{
  "category": string (e.g. "Roads", "Sanitation", "Water supply", "Electricity", "Drainage", "Parks", "Traffic", "Encroachment", "Noise/Pollution", "Other"),
  "priority": "low" | "medium" | "high" (use "high" for severe safety/hazard risks or major pipe bursts/live wires; "medium" for standard disruptions; "low" for minor cosmetic issues),
  "summary": string (a concise 1-sentence executive summary under 15 words explaining the core issue and location/risk),
  "is_spam": boolean (true if gibberish, abusive, or non-civic advertisement, otherwise false),
  "department": string (the municipal department that should handle this)
}
DO NOT include markdown backticks, explanations, or any text other than the raw JSON string.`;

  const userContent = `Category: ${categoryName}\nTitle: ${title}\nDescription: ${description}`;

  try {
    let rawText = '';

    if (provider === 'gemini') {
      // Direct REST call to Google Gemini generateContent
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userContent}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.warn(`AI Gemini call failed (${response.status}):`, errBody);
        return fallback;
      }

      const data = await response.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // Standard OpenAI format fallback
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ]
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.warn(`AI OpenAI call failed (${response.status}):`, errBody);
        return fallback;
      }

      const data = await response.json();
      rawText = data?.choices?.[0]?.message?.content || '';
    }

    // Clean JSON output (strip accidental markdown codeblocks like ```json ... ```)
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate the parsed JSON structure
    const validPriority = ['low', 'medium', 'high'].includes(parsed.priority?.toLowerCase())
      ? parsed.priority.toLowerCase()
      : 'medium';

    return {
      category: parsed.category || categoryName,
      priority: validPriority,
      summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : null,
      is_spam: Boolean(parsed.is_spam),
      department: parsed.department || null
    };
  } catch (err) {
    console.warn('AI Triage error (safely falling back to default medium priority):', err.message);
    return fallback;
  }
}

module.exports = {
  triageComplaint
};
