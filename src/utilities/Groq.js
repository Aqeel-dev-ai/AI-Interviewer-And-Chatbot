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
  difficulty = "normal"
) => {
  try {
    const systemPrompt = `You are Nova, a professional and empathetic AI interviewer. Your goal is to assess a candidate's suitability for a role in a realistic, conversational manner.`;

    let difficultyInstruction = "";
    if (difficulty === "basic") {
      difficultyInstruction = `The user has requested a simpler question. Ask a fundamental, basic-level question related to the core skills, ignoring the candidate's listed experience level for this turn.`;
    } else {
      difficultyInstruction = `Consider the candidate's experience level mentioned in the job description to adjust the question's difficulty:
      - For 'Student' or 'Fresher', focus on fundamental concepts and project experiences.
      - For 'Intermediate', ask about practical application, problem-solving scenarios, and past project details.
      - For 'Senior', probe into system design, architecture, leadership, and strategic thinking.`;
    }

    const userPrompt = `Based on the following job description, generate EXACTLY ONE relevant interview question.

    Job Description:
    ${jobDescription}

    ${difficultyInstruction}

    The question should be concise (2-3 lines max), designed to be answered verbally, and should probe for real-world understanding, not just textbook definitions. Strive for variety and creativity.

    Previously asked questions (do not repeat these): ${previousQuestions.join(
      ", "
    )}
    
    Generate the interview question now. Output ONLY the question text itself, with no extra phrases like "Here is your question:".`;

    const response = await groq.post("/chat/completions", {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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
