/**
 * Generates an app schema based on a user prompt.
 * NOTE: For production, move the API key to a backend environment variable.
 */
export async function generateFromPrompt(prompt) {
  const API_KEY = "AIzaSyDwp-d3em87SQZwAj1QsB4B2RSLvGZEQUU"; // Best practice: Use import.meta.env.VITE_GEMINI_API_KEY
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a STRICT JSON generator for a UI App Builder.

You must return ONLY valid JSON.
No markdown.
No comments.
No explanation.
No extra text.
No trailing commas.
No missing fields.

If you break any rule, your output is INVALID.

Schema rules (MANDATORY):

Root object must contain:
{
  app,
  theme,
  screens
}

app:
{
  name: string,
  packageName: string,
  icon: string
}

theme:
{
  primaryColor: string,
  backgroundColor: string
}

screens:
Array of objects, each screen MUST have:
{
  id: string,
  name: string,
  components: array
}

Each component MUST have:
{
  id: string,
  type: one of ["Text","Image","Button","List","Spacer","Container"],
  style: object
}

Rules by type:

Text:
{ id, type:"Text", props:{ text:string }, style:{} }

Button:
{ id, type:"Button", props:{ label:string, action:{ type:"navigate", targetScreenId:string } }, style:{} }

List:
{ id, type:"List", props:{ items:[string] }, style:{} }

Spacer:
{ id, type:"Spacer", props:{ height:number }, style:{} }

Image:
{ id, type:"Image", props:{ src:string, alt:string }, style:{} }

Container:
{ id, type:"Container", children:[components], style:{} }

Rules:
- Every non-container MUST have props.
- Container MUST have children.
- Button MUST use props.label (never props.text).
- style must always exist.
- All IDs must be unique.
- Every screen must have at least one component.

Generate the JSON for this app.

USER PROMPT:
${prompt}`
            }
          ],
        },
      ],
      // Optional: Force JSON response if using models that support it
      generationConfig: {
        responseMimeType: "application/json",
      }
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API error:", errText);
    throw new Error(`Gemini API request failed: ${res.status}`);
  }

  const data = await res.json();
  
  // Extract the text content
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("AI returned an empty response.");
  }

  try {
    // 1. Remove potential Markdown backticks if the model ignored instructions
    const cleanJsonString = rawText.replace(/```json|```/g, "").trim();
    
    // 2. Parse the string into a JavaScript Object
    return JSON.parse(cleanJsonString);
  } catch (parseError) {
    console.error("Failed to parse AI response as JSON:", rawText);
    throw new Error("The AI response was not valid JSON.");
  }
}