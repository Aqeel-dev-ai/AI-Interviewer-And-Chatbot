import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINIAPIKEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

const GeminiApiCall = async (prompt, history = []) => {
  try {
    console.log("History received:", history);
    
    // Create chat session with system prompt for MCQ format
    const chatSession = model.startChat({
      generationConfig,
    });
    
    // Send system prompt first to set the format
    await chatSession.sendMessage(`You are a helpful AI assistant. When asked to create multiple choice questions (MCQs), always format them exactly like this:

Question 1 : [Your question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
✅ Answer: [Correct option letter]

For regular responses, provide clear and helpful information.`);
    
    // Send the actual user prompt
    const result = await chatSession.sendMessage(prompt);
    console.log("Gemini result:", result);
    console.log("Gemini response:", result.response);
    
    // Check if response is already a string or has a text method
    let responseText;
    if (typeof result.response === 'string') {
      responseText = result.response;
    } else if (result.response && typeof result.response.text === 'function') {
      responseText = result.response.text();
    } else {
      responseText = result.response.toString();
    }
    
    console.log("Response text:", responseText);
    return responseText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    console.error("Error details:", error.message);
    throw error;
  }
};

export { GeminiApiCall };
