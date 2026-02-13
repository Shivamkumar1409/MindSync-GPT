import "dotenv/config";

const getGeminiResponse = async (message) => {
    // 1. Setup API Key and Model
    const API_KEY = process.env.GEMINI_API_KEY;
    const MODEL_NAME = "gemini-2.5-flash";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: message // Use the message argument directly
                }]
            }]
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            return reply; 
        } else {
            console.error("No valid text found in Gemini response:", data);
            return "Error: No response from AI.";
        }

    } catch (err) {
        console.error("Gemini Fetch Error:", err);
        return "Error: Could not connect to AI.";
    }
}

export default getGeminiResponse;