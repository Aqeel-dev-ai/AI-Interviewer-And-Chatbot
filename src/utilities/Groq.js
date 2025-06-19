import axios from "axios";

export const groq = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const generateInterviewQuestion = async (jobDescription, previousQuestions = []) => {
  try {
    const prompt = `Just write the question not other text, You are an expert interviewer. Based on the following job description, generate a relevant interview question. 
    Avoid questions that have already been asked, include mostly those questions that can be answered verbly. Add some real life questions.
    question should be short and concise but some technical and conceptual questions,question should be maximum 2 to 3 lines of length : ${previousQuestions.join(", ")}.
    
    Job Description: ${jobDescription}
    
    Generate a single, specific interview question that would help assess the candidate's suitability for this role.`;

    const response = await groq.post("/chat/completions", {
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.data.choices[0]?.message?.content || "Could not generate question.";
  } catch (error) {
    console.error("Error generating interview question:", error.response?.data || error.message);
    throw error;
  }
};

export const analyzeAnswer = async (question, answer, jobDescription) => {
  try {
    const prompt = `As an expert interviewer, analyze the following interview response:
    
    Question: ${question}
    Answer: ${answer}
    
    Job Description Context: ${jobDescription}
    
    Provide a professional consise review of the answers as interviewers do, 
    according to question and answer tell areas for improvements. 
    Do not use other words. Give rating to the answer "e.g 5/10".`;

    const response = await groq.post("/chat/completions", {
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.data.choices[0]?.message?.content || "Could not analyze answer.";
  } catch (error) {
    console.error("Error analyzing answer:", error.response?.data || error.message);
    throw error;
  }
};
