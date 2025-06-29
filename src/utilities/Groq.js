import axios from "axios";

export const groq = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
});

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

    const response = await groq.post("/chat/completions", {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    return (
      response.data.choices[0]?.message?.content.trim() ||
      "Could not generate a question."
    );
  } catch (error) {
    console.error(
      "Error generating interview question:",
      error.response?.data || error.message
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

    const response = await groq.post("/chat/completions", {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 300,
    });

    return response.data.choices[0]?.message?.content.trim() || "Could not analyze the answer.";
  } catch (error) {
    console.error("Error analyzing answer:", error.response?.data || error.message);
    throw error;
  }
};

export const chatWithGroq = async (userMessage, chatHistory = []) => {
  try {
    const systemPrompt = `You are Nova, a helpful and friendly AI assistant. You are knowledgeable, empathetic, and always ready to help with any questions or tasks. You provide clear, accurate, and helpful responses while maintaining a conversational and approachable tone.`;

    // Prepare messages array with system prompt and chat history
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Add chat history if provided
    if (chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    // Add the current user message
    messages.push({ role: "user", content: userMessage });

    const response = await groq.post("/chat/completions", {
      model: "llama3-70b-8192",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.data.choices[0]?.message?.content.trim() || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error in Groq chat:", error.response?.data || error.message);
    
    // Handle rate limit errors gracefully
    if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment or consider upgrading your Groq plan.");
    }
    
    throw new Error("Sorry, I'm having trouble connecting to the AI service. Please try again later.");
  }
};
