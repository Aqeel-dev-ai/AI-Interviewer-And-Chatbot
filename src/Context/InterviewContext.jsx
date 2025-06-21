import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { generateInterviewQuestion, analyzeAnswer } from "../utilities/Groq";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../utilities/firebase";

const interviewContext = createContext({
  industriesAndJobs: [],
  handleIndustryChange: () => {},
  jobTitles: [],
  onSubmit: () => {},
  register: () => {},
  handleSubmit: () => {},
  GenerateQuestions: false,
  setValue: [],
  value: [],
  questions: [],
  handleNextQuestion: () => {},
  btndisable: false,
  interviewComplete: false,
  response: null,
  generateResult: false,
  index: 0,
  setCurrentAnswer: "",
  currentAnswer: "",
  analysisResults: [],
  transcript: [],
  isInterviewing: false,
  isListening: false,
  isSpeaking: false,
  startVoiceInterview: () => {},
  stopVoiceInterview: () => {},
  isPreparing: false,
  countdown: 10,
  userStream: null,
  isCameraOn: false,
});

const InterviewContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const industriesAndJobs = [
    {
      industry: " Software Development",
      jobs: [
        " Software Engineering",
        "Application Development",
        "Systems Integration",
        "Quality Assurance and Testing",
      ],
    },
    {
      industry: " Web and Mobile App Development",
      jobs: [
        "Mernstack ",
        "Frontend Developer",
        "Backend Developer",
        "Fullstack Developer",
        "Mobile App Developer (iOS/Android)",
        "React Developer",
        "Angular Developer",
        "UI/UX Designer",
        "Flutter Developer",
      ],
    },
    {
      industry: " Data Science and Analytics",
      jobs: [
        "Data Scientist",
        "Data Analyst",
        "Data Engineer",
        "Business Intelligence Analyst",
        "Machine Learning Engineer",
        "Data Visualization Specialist",
      ],
    },
    {
      industry: "Artificial Intelligence",
      jobs: [
        "AI Research Scientist",
        "Machine Learning Engineer",
        "Deep Learning Specialist",
        "AI Software Engineer",
        "Computer Vision Engineer",
        "NLP Engineer",
      ],
    },
    {
      industry: "Cybersecurity",
      jobs: [
        "Cybersecurity Analyst",
        "Security Engineer",
        "Penetration Tester",
        "Ethical Hacker",
        "Security Operations Center (SOC) Analyst",
        "Network Security Engineer",
      ],
    },
    {
      industry: "Education Technology (EdTech)",
      jobs: [
        " E-Learning Developer",
        "Curriculum Designer (Tech-based)",
        "Educational Data Analyst",
        "Instructional Designer",
      ],
    },
    {
      industry: " Cloud Computing and DevOps",
      jobs: [
        " Cloud Engineering (AWS, Azure, GCP)",
        "DevOps Engineer (CI/CD, Kubernetes)",
        "Site Reliability Engineering (SRE)",
        "Cloud Solutions Architect",
      ],
    },
    {
      industry: "E-commerce & Fintech",
      jobs: [
        "E-commerce Manager",
        "Product Manager (Fintech)",
        "Blockchain Developer",
        "Fintech Analyst",
        "Payment Gateway Specialist",
        "Digital Marketing Manager",
      ],
    },
    {
      industry: "Telecommunications & Networking",
      jobs: [
        "Network Engineer",
        "Telecommunications Technician",
        "Wireless Communications Specialist",
        "IoT Engineer",
        "Network Administrator",
      ],
    },
    {
      industry: "Robotics & Automation",
      jobs: [
        "Robotics Engineer",
        "Automation Engineer",
        "Mechatronics Engineer",
        "Control Systems Engineer",
        "Industrial Automation Specialist",
      ],
    },
    {
      industry: "Gaming & Entertainment",
      jobs: [
        "Game Developer",
        "Game Designer",
        "3D Animator",
        "VR/AR Developer",
        "Multimedia Designer",
        "Sound Designer",
      ],
    },
    {
      industry: "Internet of Things and Smart Technology",
      jobs: [
        "IoT Engineer",
        "Embedded Systems Engineer",
        "IoT Security Specialist",
        "IoT Data Analyst",
      ],
    },
    {
      industry: "Health Tech",
      jobs: [
        "Health Informatics Specialist",
        "Biomedical Engineer",
        "Clinical Systems Analyst",
        "Health Data Analyst",
        "Telemedicine Specialist",
      ],
    },
  ];
  const location = useLocation();
  const [Answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [generateResult, setGenerateResult] = useState(false);
  const { register, handleSubmit } = useForm();
  const [jobTitles, setJobTitles] = useState([]);
  const [GenerateQuestions, setGenerateQuestions] = useState(false);
  const [value, setValue] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [btndisable, setBtnDisable] = useState(false);
  const [questions, setQuestions] = useState(location?.state?.questions || []);
  const [jobTitle, setJobTitle] = useState(location?.state?.jobTitle || null);
  const [userdetail, setUserDetail] = useState(
    location?.state?.userDetails || null
  );
  const { setError, User } = useAuth();
  const [analysisResults, setAnalysisResults] = useState([]);

  // New state for video
  const [userStream, setUserStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // New state for voice interview
  const [transcript, setTranscript] = useState([]);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // New state for countdown
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  // New state for adaptive interview
  const [consecutivePoorAnswers, setConsecutivePoorAnswers] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState("normal");
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const speechTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const recognitionRef = useRef(null); // Ref to hold the recognition instance

  const getRandomSkipPhrase = () => {
    const phrases = [
      "No problem, we can skip that one.",
      "Alright, let's move to the next question.",
      "That's fine. Let's try a different one.",
      "Understood. Moving on to the next question."
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  useEffect(() => {
    if (response) {
      addDoc(collection(db, "Interview"), {
        Result: response,
        timestamp: serverTimestamp(),
        UserId: User.uid,
        jobTitle,
      })
        .then(() => {
          setQuestions([]);
          setGenerateResult(false);
          setBtnDisable(false);
          setJobTitle(null);
          setInterviewComplete(true);
          setUserDetail(null);
        })
        .catch((error) => {
          setBtnDisable(false);
          setGenerateResult(false);
          setError(error.code || error.message);
        });
    }
  }, [response]);

  // Countdown logic
  useEffect(() => {
    if (!isPreparing) return;

    if (countdown === 0) {
      setIsPreparing(false);
      startCustomInterviewFlow(); // Start with the custom greeting and question
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isPreparing, countdown, questions]);

  const onSubmit = async (formData) => {
    try {
      setGenerateQuestions(true);
      setBtnDisable(true);
      
      // Ensure we have all required fields
      if (!formData.JobTitle || !formData.Experience || !value.length) {
        throw new Error("Please fill in all required fields including skills");
      }

      const jobDescription = `Job Title: ${formData.JobTitle}\nExperience: ${formData.Experience}\nSkills: ${value.join(", ")}`;
      
      // Generate questions using Groq
      const questions = [];
      for (let i = 0; i < 5; i++) {
        const question = await generateInterviewQuestion(jobDescription, questions);
        questions.push(question);
      }
      
      setQuestions(questions);
      setJobTitle(formData.JobTitle);
      setUserDetail({
        ...formData,
        skills: value
      });
      setGenerateQuestions(false);
      setBtnDisable(false);
      navigate("/interview", {
        state: { 
          questions, 
          jobTitle: formData.JobTitle, 
          userDetails: {
            ...formData,
            skills: value
          }
        },
      });
    } catch (error) {
      setError(error.message);
      setGenerateQuestions(false);
      setBtnDisable(false);
    }
  };

  const handleIndustryChange = (e) => {
    const selectedIndustry = e.target.value;
    const findJobs = industriesAndJobs.find(
      (obj) => obj.industry === selectedIndustry
    );
    if (findJobs) {
      setJobTitles(findJobs.jobs);
    } else {
      setJobTitles([]);
    }
  };

  // Voice Interview Logic
  const speakText = (text, onEndCallback) => {
    if (!text) return;
    setIsSpeaking(true);
    setIsListening(false);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) {
        onEndCallback();
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const startSpeechRecognition = () => {
    setIsListening(true);
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognitionRef.current = recognition; // Store the instance
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    // If user says nothing for 10s, ask to repeat or skip.
    silenceTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
        setIsWaitingForConfirmation(true);
        speakText("I didn't hear anything. Should I repeat the question, or do you want to move to the next one?", () => {
            startSpeechRecognition();
        });
    }, 10000);

    recognition.onresult = (event) => {
      // User has started speaking, so clear both timeouts.
      clearTimeout(silenceTimeoutRef.current);
      clearTimeout(speechTimeoutRef.current);

      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
      }
      
      // Wait for a 4-second pause in speech before finalizing answer.
      speechTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
        const finalAnswer = finalTranscript.trim();
        if (finalAnswer) {
          setTranscript((prev) => [...prev, { speaker: "user", text: finalAnswer }]);
          handleUserAnswer(finalAnswer);
        }
      }, 4000);
    };
    
    recognition.onerror = (event) => {
      clearTimeout(silenceTimeoutRef.current);
      clearTimeout(speechTimeoutRef.current);
      setIsListening(false);
      // Handle errors other than 'no-speech', which is covered by our timeout.
      if (event.error !== "no-speech") {
         console.error("Speech recognition error:", event.error);
         speakText("I'm having a little trouble hearing. Let's try that question again.", () => speakText(questions[index], () => startSpeechRecognition()));
      }
    };
    
    recognition.onend = () => {
        clearTimeout(silenceTimeoutRef.current);
        clearTimeout(speechTimeoutRef.current);
        setIsListening(false);
    }

    recognition.start();
  };

  const askNewQuestion = async (difficulty = "normal") => {
    const jobDescription = `Job Title: ${jobTitle}\nExperience: ${userdetail.experience}\nSkills: ${userdetail.skills.join(", ")}`;
    const newQuestion = await generateInterviewQuestion(jobDescription, questions, difficulty);
    setQuestions(prev => [...prev, newQuestion]); // Add new question to history
    setTranscript(prev => [...prev, { speaker: "ai", text: newQuestion }]);
    speakText(newQuestion, () => {
      startSpeechRecognition();
    });
  };

  const handleUserAnswer = async (answer) => {
    const lowerCaseAnswer = answer.toLowerCase();
    console.log("--- handleUserAnswer triggered ---");
    console.log(`Answer received: "${lowerCaseAnswer}"`);
    console.log(`'isWaitingForConfirmation' is currently: ${isWaitingForConfirmation}`);

    // 1. Check if we are waiting for a "repeat" or "skip" confirmation
    if (isWaitingForConfirmation) {
      console.log("Entering confirmation logic branch.");
      setIsWaitingForConfirmation(false);
      if (lowerCaseAnswer.includes("repeat")) {
        console.log("Action: Repeating the question.");
        speakText(`Of course. The question was: ${questions[index]}`, () => {
          startSpeechRecognition();
        });
      } else if (lowerCaseAnswer.includes("skip") || lowerCaseAnswer.includes("next")) {
        console.log("Action: Skipping question after confirmation.");
        const skipResponse = getRandomSkipPhrase();
        setTranscript(prev => [...prev, { speaker: "ai", text: skipResponse }]);
        speakText(skipResponse, () => moveToNextQuestion());
      } else {
        console.log("Action: Confirmation not understood, re-asking.");
        speakText("My apologies, I didn't understand. Let's try the question again.", () => {
           speakText(questions[index], () => startSpeechRecognition());
        });
      }
      return; // Stop further processing
    }

    // 2. Check for keywords if not in a confirmation state
    console.log("Checking for standard keywords...");
    const skipPhrases = ["i don't know", "skip", "pass", "i do not know", "no idea", "next question"];
    if (skipPhrases.some(phrase => lowerCaseAnswer.includes(phrase))) {
      console.log("Action: 'skip' keyword detected. Moving to next question.");
      const skipResponse = getRandomSkipPhrase();
      setTranscript(prev => [...prev, { speaker: "ai", text: skipResponse }]);
      speakText(skipResponse, () => moveToNextQuestion());
      return; // Stop further processing
    }

    if (lowerCaseAnswer.includes("simple question") || lowerCaseAnswer.includes("easier question")) {
      console.log("Action: 'simple question' keyword detected. Asking a basic question.");
      speakText("Of course, let's try a more fundamental question.", () => {
        askNewQuestion("basic");
      });
      return; // Stop further processing
    }
    
    // 3. If no keywords, proceed with analyzing the answer
    console.log("No keywords detected. Proceeding to analyze answer.");
    if (answer.length < 10) {
       console.log("Answer is too short. Re-phrasing question.");
       speakText("I think you might have misunderstood. Let me rephrase that for you.", () => {
           const currentQuestion = questions[index];
           speakText(currentQuestion, () => startSpeechRecognition());
       });
       return;
    }

    console.log("Analyzing the answer for feedback and rating.");
    const newAnswers = [...Answers, { question: questions[index], answer }];
    setAnswers(newAnswers);

    const jobDescription = `Job Title: ${jobTitle}\nExperience: ${userdetail.experience}\nSkills: ${userdetail.skills.join(", ")}`;
    const analysisText = await analyzeAnswer(questions[index], answer, jobDescription);
    
    let rating = 0;
    const ratingMatch = analysisText.match(/Rating\s*[:\-]?\s*(\d{1,2})\s*\/\s*10/i);
    if (ratingMatch) {
      rating = parseInt(ratingMatch[1], 10);
    }
    
    if (rating < 5) {
      const newPoorCount = consecutivePoorAnswers + 1;
      setConsecutivePoorAnswers(newPoorCount);
      if (newPoorCount >= 2) {
        setCurrentDifficulty("basic");
        speakText("Let's switch gears and try a more fundamental topic.", () => moveToNextQuestion("basic"));
        return;
      }
    } else {
      setConsecutivePoorAnswers(0);
      setCurrentDifficulty("normal");
    }

    moveToNextQuestion();
  };
  
  const moveToNextQuestion = (difficulty = "normal") => {
    if (index >= questions.length - 1) {
      // End of original questions, proceed to generate results
      setGenerateResult(true);
      const endMessage = "Thank you. Your interview is now complete. We are generating your results.";
      setTranscript((prev) => [...prev, { speaker: "ai", text: endMessage }]);
      speakText(endMessage, () => {
        stopVoiceInterview();
        setInterviewComplete(true);
        // Trigger result saving
        setResponse(Answers); 
      });
    } else {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      setTranscript((prev) => [...prev, { speaker: "ai", text: nextQuestion }]);
      speakText(nextQuestion, () => {
        startSpeechRecognition();
      });
    }
  };

  const startCustomInterviewFlow = () => {
    const greeting = `Hello ${User?.displayName || 'there'}, welcome to your interview for the ${jobTitle} role. I see you have ${userdetail.experience} experience. Let's begin.`;
    const firstQuestion = `To start, could you please tell me a bit about your journey and what led you to apply for this ${jobTitle} position?`;

    // Prepend the custom question to the AI-generated list
    const allQuestions = [firstQuestion, ...questions];
    setQuestions(allQuestions);
    setIndex(0);
    setAnswers([]);
    
    setTranscript([{ speaker: "ai", text: greeting }, { speaker: "ai", text: firstQuestion }]);
    
    setIsInterviewing(true);

    speakText(greeting, () => {
        speakText(firstQuestion, () => {
            startSpeechRecognition();
        });
    });
  };

  const startVoiceInterview = async () => {
    if (questions && questions.length > 0 && userdetail) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setUserStream(stream);
        setIsCameraOn(true);
        setIsPreparing(true);
        setCountdown(5);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError(
          "Camera and microphone access are required for a video interview. Please grant permission and try again."
        );
        navigate("/interview-form");
      }
    } else {
      setError("No questions generated. Please fill the form first.");
      navigate("/interview-form");
    }
  };

  const stopVoiceInterview = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    clearTimeout(silenceTimeoutRef.current);
    clearTimeout(speechTimeoutRef.current);

    if (userStream) {
      userStream.getTracks().forEach((track) => track.stop());
      setUserStream(null);
    }
    setIsCameraOn(false);

    setIsInterviewing(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsPreparing(false);
    
    // Immediately show results
    setInterviewComplete(true);
    setResponse(Answers); // Ensure results are set for display
    console.log("Interview stopped by user. Finalizing results.");
  };

  const handleNextQuestion = async () => {
    try {
      if (currentAnswer.trim() === "") {
        setError("Please provide an answer before proceeding.");
        return;
      }

      setBtnDisable(true);
      const newAnswers = [...Answers, currentAnswer];
      setAnswers(newAnswers);
      setCurrentAnswer("");

      if (index === questions.length - 1) {
        setGenerateResult(true);
        const jobDescription = `Job Title: ${jobTitle}\nExperience: ${userdetail.experience}\nSkills: ${userdetail.skills.join(", ")}`;
        
        // Analyze answers using Groq
        const analyses = [];
        for (let i = 0; i < questions.length; i++) {
          const analysisText = await analyzeAnswer(questions[i], newAnswers[i], jobDescription);
          // Parse analysisText to extract rating and feedback
          // Example expected format: "Rating: 7/10\nFeedback: Good try, but you need to improve these topics: ..."
          let rating = 0;
          let feedback = "";
          const ratingMatch = analysisText.match(/Rating\s*[:\-]?\s*(\d{1,2})\s*\/\s*10/i);
          if (ratingMatch) {
            rating = parseInt(ratingMatch[1], 10);
          }
          const feedbackMatch = analysisText.match(/Feedback\s*[:\-]?\s*([\s\S]*)/i);
          if (feedbackMatch) {
            feedback = feedbackMatch[1].trim();
          } else {
            feedback = analysisText.trim();
          }
          analyses.push({
            question: questions[i],
            answer: newAnswers[i],
            rating,
            feedback
          });
        }
        setAnalysisResults(analyses);
        setResponse(analyses); // for backward compatibility
        setInterviewComplete(true);
      } else {
        setIndex(index + 1);
        setBtnDisable(false);
      }
    } catch (error) {
      setError(error.message);
      setBtnDisable(false);
    }
  };

  return (
    <interviewContext.Provider
      value={{
        industriesAndJobs,
        handleIndustryChange,
        jobTitles,
        onSubmit,
        register,
        handleSubmit,
        btndisable,
        GenerateQuestions,
        setValue,
        value,
        questions,
        handleNextQuestion,
        interviewComplete,
        response,
        generateResult,
        index,
        setCurrentAnswer,
        currentAnswer,
        analysisResults,
        transcript,
        isInterviewing,
        isListening,
        isSpeaking,
        startVoiceInterview,
        stopVoiceInterview,
        isPreparing,
        countdown,
        userStream,
        isCameraOn,
      }}
    >
      {children}
    </interviewContext.Provider>
  );
};

const useInterviewContext = () => {
  return useContext(interviewContext);
};

export { InterviewContextProvider, useInterviewContext };
