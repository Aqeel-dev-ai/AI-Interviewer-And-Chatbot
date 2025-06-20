import { createContext, useContext, useEffect, useState } from "react";
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

  // New state for voice interview
  const [transcript, setTranscript] = useState([]);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // New state for countdown
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdown, setCountdown] = useState(10);

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
      setIsInterviewing(true);
      setIndex(0);
      setAnswers([]);
      setTranscript([{ speaker: "ai", text: questions[0] }]);
      speakText(questions[0], () => {
        startSpeechRecognition();
      });
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
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      recognition.stop();
      setIsListening(false);
      if (spokenText.trim() === "") {
        speakText("I didn't catch that. Could you please repeat your answer?", () => {
          startSpeechRecognition();
        });
        return;
      }
      setTranscript((prev) => [...prev, { speaker: "user", text: spokenText }]);
      handleUserAnswer(spokenText);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(event.error);
      if (event.error === "no-speech") {
        speakText("I didn't hear an answer. Let's try again.", () => {
          startSpeechRecognition();
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleUserAnswer = async (answer) => {
    const newAnswers = [...Answers, answer];
    setAnswers(newAnswers);

    if (index >= questions.length - 1) {
      setGenerateResult(true);
      const jobDescription = `Job Title: ${jobTitle}\nExperience: ${
        userdetail.experience
      }\nSkills: ${userdetail.skills.join(", ")}`;

      const analyses = [];
      for (let i = 0; i < questions.length; i++) {
        const currentQuestionAnswer = i === index ? answer : newAnswers[i-1];
        const analysisText = await analyzeAnswer(
          questions[i],
          currentQuestionAnswer,
          jobDescription
        );

        let rating = 0;
        let feedback = "";
        const ratingMatch = analysisText.match(
          /Rating\s*[:\-]?\s*(\d{1,2})\s*\/\s*10/i
        );
        if (ratingMatch) {
          rating = parseInt(ratingMatch[1], 10);
        }
        const feedbackMatch = analysisText.match(
          /Feedback\s*[:\-]?\s*([\s\S]*)/i
        );
        if (feedbackMatch) {
          feedback = feedbackMatch[1].trim();
        } else {
          feedback = analysisText.trim();
        }
        analyses.push({
          question: questions[i],
          answer: currentQuestionAnswer,
          rating,
          feedback,
        });
      }
      setAnalysisResults(analyses);
      setResponse(analyses);

      const endMessage =
        "Thank you. Your interview is now complete. We are now generating your results.";
      setTranscript((prev) => [...prev, { speaker: "ai", text: endMessage }]);
      speakText(endMessage, () => {
        stopVoiceInterview();
        setInterviewComplete(true);
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

  const startVoiceInterview = () => {
    if (questions && questions.length > 0) {
      setIsPreparing(true);
      setCountdown(10);
    } else {
      setError("No questions generated. Please fill the form first.");
      navigate("/interview-form");
    }
  };

  const stopVoiceInterview = () => {
    window.speechSynthesis.cancel();
    setIsInterviewing(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsPreparing(false);
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
