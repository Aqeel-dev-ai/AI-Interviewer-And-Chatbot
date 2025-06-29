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

export const generateInterviewQuestion = async (
  jobDescription,
  previousQuestions = [],
  questionIndex = 0
) => {
  try {
    const systemPrompt = `You are Nova, a professional and empathetic AI interviewer. Your goal is to assess a candidate's suitability for a role in a realistic, conversational manner. Start with fundamental concepts and progressively move to more advanced topics.`;

    // Create a progression system based on question index
    let progressionInstruction = "";
    if (questionIndex === 0) {
      progressionInstruction = `This is the FIRST question. Start with the MOST BASIC and FUNDAMENTAL concepts of the core technologies mentioned in the job description. For example:
      - For Frontend roles: Start with HTML basics, CSS fundamentals, or JavaScript basics
      - For React roles: Start with React components, JSX, or basic React concepts
      - For Backend roles: Start with basic programming concepts, data types, or simple algorithms
      - For Data Science: Start with basic statistics, data types, or simple data manipulation
      Ask a foundational question that any beginner should know about the core technology.`;
    } else if (questionIndex <= 2) {
      progressionInstruction = `This is an EARLY question (${questionIndex + 1} of the interview). Focus on basic to intermediate concepts of the core technologies. Ask about:
      - Basic syntax and usage
      - Common methods and functions
      - Simple problem-solving scenarios
      - Basic best practices`;
    } else if (questionIndex <= 4) {
      progressionInstruction = `This is a MID-LEVEL question (${questionIndex + 1} of the interview). Focus on intermediate concepts and practical application. Ask about:
      - Real-world usage scenarios
      - Common patterns and practices
      - Problem-solving with the technology
      - Integration and workflow`;
    } else {
      progressionInstruction = `This is an ADVANCED question (${questionIndex + 1} of the interview). Focus on advanced concepts, optimization, and deep understanding. Ask about:
      - Advanced features and techniques
      - Performance optimization
      - Architecture and design patterns
      - Troubleshooting and debugging
      - Best practices and industry standards`;
    }

    const userPrompt = `Based on the following job description, generate EXACTLY ONE relevant interview question.

    Job Description:
    ${jobDescription}

    ${progressionInstruction}

    IMPORTANT: Focus on the CORE TECHNOLOGIES mentioned in the job description. For example:
    - If "React" is mentioned, ask about React concepts
    - If "JavaScript" is mentioned, ask about JavaScript fundamentals
    - If "Python" is mentioned, ask about Python basics
    - If "SQL" is mentioned, ask about database concepts
    - If "HTML/CSS" is mentioned, ask about web fundamentals

    The question should be concise (2-3 lines max), designed to be answered verbally, and should probe for real-world understanding, not just textbook definitions.

    Previously asked questions (do not repeat these): ${previousQuestions.join(
      ", "
    )}
    
    Generate the interview question now. Output ONLY the question text itself, with no extra phrases like "Here is your question:".`;

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim() || "Could not generate a question.";
  } catch (error) {
    console.error(
      "Error generating interview question:",
      error.message
    );
    throw error;
  }
};

export const analyzeAnswer = async (question, answer, jobDescription) => {
  try {
    const systemPrompt = `You are an expert interview analyst. Your task is to review an answer and provide concise, constructive feedback and a rating.`;

    const userPrompt = `Please analyze the following interview response based on the provided job context.

    Job Description Context:
    ${jobDescription}

    Question Asked: "${question}"
    Candidate's Answer: "${answer}"

    Your analysis must include two parts:
    1.  **Feedback**: Provide brief, actionable feedback on the answer's quality, technical accuracy, and clarity. Mention areas for improvement.
    2.  **Rating**: Give a numerical rating out of 10.

    Format your entire response as follows, with no extra text or pleasantries:
    Feedback: [Your feedback here]
    Rating: [Your rating here]/10`;

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim() || "Could not analyze the answer.";
  } catch (error) {
    console.error("Error analyzing answer:", error.message);
    throw error;
  }
};

export { GeminiApiCall };
