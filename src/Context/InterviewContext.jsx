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
  btndisable: false,
  interviewComplete: false,
  response: null,
  index: 0,
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
  const { register, handleSubmit } = useForm();
  const [jobTitles, setJobTitles] = useState([]);
  const [GenerateQuestions, setGenerateQuestions] = useState(false);
  const [value, setValue] = useState([]);
  const [btndisable, setBtnDisable] = useState(false);
  const [questions, setQuestions] = useState(location?.state?.questions || []);
  const [jobTitle, setJobTitle] = useState(location?.state?.jobTitle || null);
  const [userdetail, setUserDetail] = useState(
    location?.state?.userDetails || null
  );
  const { setError, User } = useAuth();
  const [analysisResults, setAnalysisResults] = useState([]);

  // Video state
  const [userStream, setUserStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Voice interview state
  const [transcript, setTranscript] = useState([]);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Countdown state
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  const speechTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);

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
          setBtnDisable(false);
          setJobTitle(null);
          setInterviewComplete(true);
          setUserDetail(null);
        })
        .catch((error) => {
          setBtnDisable(false);
          setError(error.code || error.message);
        });
    }
  }, [response]);

  // Countdown logic
  useEffect(() => {
    if (!isPreparing) return;

    if (countdown === 0) {
      setIsPreparing(false);
      startInterview();
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isPreparing, countdown]);

  const onSubmit = async (formData, formType = "manual") => {
    try {
      setGenerateQuestions(true);
      setBtnDisable(true);
      
      let jobDescription = "";
      let userDetailsPayload = {};

      if (formType === "resume") {
        if (!formData.JobTitle || !formData.Experience || !formData.resumeText) {
          throw new Error("Please provide a job title, experience level, and a valid resume.");
        }
        jobDescription = `Job Title: ${formData.JobTitle}\nExperience: ${formData.Experience}\nResume Content: ${formData.resumeText}`;
        userDetailsPayload = {
          JobTitle: formData.JobTitle,
          Experience: formData.Experience,
          skills: ["Parsed from resume"],
        }
      } else {
        if (!formData.JobTitle || !formData.Experience || !value.length) {
          throw new Error("Please fill in all required fields including skills");
        }
        jobDescription = `Job Title: ${formData.JobTitle}\nExperience: ${formData.Experience}\nSkills: ${value.join(", ")}`;
        userDetailsPayload = {
          ...formData,
          skills: value
        }
      }
      
      const questions = [];
      for (let i = 0; i < 5; i++) {
        const question = await generateInterviewQuestion(jobDescription, questions);
        questions.push(question);
      }
      
      setQuestions(questions);
      setJobTitle(formData.JobTitle);
      setUserDetail(userDetailsPayload);

      setGenerateQuestions(false);
      setBtnDisable(false);
      navigate("/interview", {
        state: { 
          questions, 
          jobTitle: formData.JobTitle, 
          userDetails: userDetailsPayload
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
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    silenceTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
        speakText("I didn't hear anything. Let me repeat the question.", () => {
            speakText(questions[index], () => startSpeechRecognition());
        });
    }, 10000);

    recognition.onresult = (event) => {
      clearTimeout(silenceTimeoutRef.current);
      clearTimeout(speechTimeoutRef.current);

      let combinedTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        combinedTranscript += event.results[i][0].transcript;
      }
      
      speechTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
        const finalAnswer = combinedTranscript.trim();
        if (finalAnswer) {
          setTranscript((prev) => [...prev, { speaker: "user", text: finalAnswer }]);
          handleUserAnswer(finalAnswer);
        }
      }, 3000);
    };
    
    recognition.onerror = (event) => {
      clearTimeout(silenceTimeoutRef.current);
      clearTimeout(speechTimeoutRef.current);
      setIsListening(false);
      if (event.error !== "no-speech") {
         console.error("Speech recognition error:", event.error);
         speakText("I'm having trouble hearing. Let me repeat the question.", () => 
           speakText(questions[index], () => startSpeechRecognition())
         );
      }
    };
    
    recognition.onend = () => {
        clearTimeout(silenceTimeoutRef.current);
        clearTimeout(speechTimeoutRef.current);
        setIsListening(false);
    }

    recognition.start();
  };

  const handleUserAnswer = async (answer) => {
    if (answer.length < 10) {
       speakText("Could you please provide a more detailed answer?", () => {
           speakText(questions[index], () => startSpeechRecognition());
       });
       return;
    }

    const newAnswers = [...Answers, { question: questions[index], answer }];
    setAnswers(newAnswers);

    const jobDescription = `Job Title: ${jobTitle}\nExperience: ${userdetail.experience}\nSkills: ${userdetail.skills.join(", ")}`;
    await analyzeAnswer(questions[index], answer, jobDescription);

    moveToNextQuestion();
  };
  
  const moveToNextQuestion = () => {
    if (index >= questions.length - 1) {
      const endMessage = "Thank you. Your interview is now complete. We are generating your results.";
      setTranscript((prev) => [...prev, { speaker: "ai", text: endMessage }]);
      speakText(endMessage, () => {
        stopVoiceInterview();
        setInterviewComplete(true);
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

  const startInterview = () => {
    const greeting = `Hello ${User?.displayName || 'there'}, welcome to your interview for the ${jobTitle} role. Let's begin.`;
    const firstQuestion = questions[0];

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
    
    setInterviewComplete(true);
    setResponse(Answers);
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
        interviewComplete,
        response,
        index,
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
