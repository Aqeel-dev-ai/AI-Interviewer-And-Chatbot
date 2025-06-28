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
  const currentQuestionIndexRef = useRef(0);
  const isInterviewStoppedRef = useRef(false);

  useEffect(() => {
    if (response) {
      console.log("Response received, saving to Firebase:", response);
      console.log("Current analysis results:", analysisResults);
      console.log("Job title:", jobTitle);
      console.log("User ID:", User.uid);
      
      addDoc(collection(db, "Interview"), {
        Result: response,
        timestamp: serverTimestamp(),
        UserId: User.uid,
        jobTitle,
      })
        .then((docRef) => {
          console.log("Interview saved successfully with ID:", docRef.id);
          setQuestions([]);
          setBtnDisable(false);
          setJobTitle(null);
          setInterviewComplete(true);
          setUserDetail(null);
          
          // Navigate to Result page with the interview data
          const percentage = calculatePercentage(response);
          console.log("Calculated percentage:", percentage);
          navigate("/result", {
            state: {
              percentage: percentage,
              questionsAndAnswers: response,
              jobTitle: jobTitle,
              fromInterview: true
            }
          });
        })
        .catch((error) => {
          console.error("Error saving interview:", error);
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
    // Check if interview was stopped before speaking
    if (isInterviewStoppedRef.current) {
      console.log("Interview was stopped, not speaking text");
      if (onEndCallback) onEndCallback();
      return;
    }

    if (!text) {
      if (onEndCallback) onEndCallback();
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    setIsSpeaking(true);
    setIsListening(false);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.volume = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) {
        onEndCallback();
      }
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      if (onEndCallback) {
        onEndCallback();
      }
    };
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error starting speech synthesis:", error);
      setIsSpeaking(false);
      if (onEndCallback) {
        onEndCallback();
      }
    }
  };

  const startSpeechRecognition = () => {
    // Check if interview was stopped
    if (isInterviewStoppedRef.current) {
      console.log("Interview was stopped, not starting speech recognition");
      return;
    }

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Speech recognition not supported");
      setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    // Prevent multiple speech recognition instances
    if (recognitionRef.current) {
      console.log("Speech recognition already running, stopping previous instance");
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping previous recognition:", error);
      }
    }

    // Use the ref to get the current question index
    const currentIndex = currentQuestionIndexRef.current;
    const currentQuestion = questions[currentIndex];
    
    console.log(`Starting speech recognition for question ${currentIndex + 1}: ${currentQuestion}`);

    setIsListening(true);
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    // Clear any existing timeouts
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }

    silenceTimeoutRef.current = setTimeout(() => {
        // Check if interview was stopped before showing the message
        if (isInterviewStoppedRef.current) {
          console.log("Interview was stopped, not showing silence message");
          return;
        }
        
        console.log("Silence timeout - no speech detected");
        recognition.stop();
        setIsListening(false);
        speakText("I didn't hear anything. Let me repeat the question.", () => {
            if (!isInterviewStoppedRef.current) {
              speakText(currentQuestion, () => startSpeechRecognition());
            }
        });
    }, 10000);

    recognition.onresult = (event) => {
      clearTimeout(silenceTimeoutRef.current);
      clearTimeout(speechTimeoutRef.current);

      let combinedTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        combinedTranscript += event.results[i][0].transcript;
      }
      
      console.log(`Speech detected: ${combinedTranscript}`);
      
      speechTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
        const finalAnswer = combinedTranscript.trim();
        if (finalAnswer && !isInterviewStoppedRef.current) {
          console.log(`Processing answer for question ${currentIndex + 1}`);
          setTranscript((prev) => [...prev, { speaker: "user", text: finalAnswer }]);
          handleUserAnswer(finalAnswer, currentIndex);
        } else if (!isInterviewStoppedRef.current) {
          // If no answer was captured, restart recognition
          console.log("No answer captured, restarting recognition");
          speakText("I didn't catch that. Could you please repeat your answer?", () => {
            if (!isInterviewStoppedRef.current) {
              startSpeechRecognition();
            }
          });
        }
      }, 3000);
    };
    
    recognition.onerror = (event) => {
      clearTimeout(silenceTimeoutRef.current);
      clearTimeout(speechTimeoutRef.current);
      setIsListening(false);
      
      console.error("Speech recognition error:", event.error);
      
      if (event.error !== "no-speech" && !isInterviewStoppedRef.current) {
         speakText("I'm having trouble hearing. Let me repeat the question.", () => 
           speakText(currentQuestion, () => startSpeechRecognition())
         );
      }
    };
    
    recognition.onend = () => {
        console.log("Speech recognition ended");
        clearTimeout(silenceTimeoutRef.current);
        clearTimeout(speechTimeoutRef.current);
        setIsListening(false);
    }

    try {
      recognition.start();
      console.log("Speech recognition started successfully");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
      setError("Failed to start speech recognition. Please try again.");
    }
  };

  const handleUserAnswer = async (answer, questionIndex) => {
    const currentQuestion = questions[questionIndex];
    
    console.log(`handleUserAnswer called for question ${questionIndex + 1}: ${currentQuestion}`);
    console.log(`Answer received: ${answer}`);
    
    if (answer.length < 10) {
       console.log("Answer too short, asking for more detail");
       speakText("Could you please provide a more detailed answer?", () => {
           speakText(currentQuestion, () => startSpeechRecognition());
       });
       return;
    }

    console.log("Processing valid answer");
    const newAnswers = [...Answers, { question: currentQuestion, answer }];
    setAnswers(newAnswers);

    try {
      const jobDescription = `Job Title: ${jobTitle}\nExperience: ${userdetail.Experience || userdetail.experience}\nSkills: ${userdetail.skills.join(", ")}`;
      const analysis = await analyzeAnswer(currentQuestion, answer, jobDescription);
      
      // Store the analysis result
      setAnalysisResults(prev => [...prev, {
        question: currentQuestion,
        answer,
        analysis
      }]);
      console.log("Answer analysis completed");
    } catch (error) {
      console.error("Error analyzing answer:", error);
      // Continue with the interview even if analysis fails
    }

    console.log("Calling moveToNextQuestion");
    moveToNextQuestion(questionIndex);
  };
  
  const moveToNextQuestion = (currentIndex) => {
    console.log(`moveToNextQuestion called. Current index: ${currentIndex}, Total questions: ${questions.length}`);
    
    if (currentIndex >= questions.length - 1) {
      console.log("Interview complete - all questions answered");
      const endMessage = "Thank you. Your interview is now complete. We are generating your results.";
      setTranscript((prev) => [...prev, { speaker: "ai", text: endMessage }]);
      speakText(endMessage, () => {
        // Stop the interview and wait for analysis to complete
        stopVoiceInterview();
        setInterviewComplete(true);
        
        // Wait a bit for any pending analysis to complete, then set response
        setTimeout(() => {
          console.log("Setting response with answers:", Answers);
          console.log("Analysis results:", analysisResults);
          setResponse(Answers);
        }, 2000); // Wait 2 seconds for analysis to complete
      });
    } else {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex];
      
      console.log(`Moving to question ${nextIndex + 1}: ${nextQuestion}`);
      
      // Update both state and ref
      setIndex(nextIndex);
      currentQuestionIndexRef.current = nextIndex;
      
      // Add a brief pause and transition message
      const transitionMessage = "Thank you for that answer. Here's your next question.";
      setTranscript((prev) => [...prev, { speaker: "ai", text: transitionMessage }]);
      
      speakText(transitionMessage, () => {
        setTimeout(() => {
          // Ask the next question
          console.log(`Setting index to ${nextIndex}`);
          setTranscript((prev) => [...prev, { speaker: "ai", text: nextQuestion }]);
          speakText(nextQuestion, () => {
            // Use a small delay to ensure state is updated
            setTimeout(() => {
              console.log(`Starting speech recognition for next question (index: ${nextIndex})`);
              startSpeechRecognition();
            }, 100);
          });
        }, 1000); // 1 second pause between questions
      });
    }
  };

  const startInterview = () => {
    const greeting = `Hello ${User?.displayName || 'there'}, welcome to your interview for the ${jobTitle} role. Let's begin.`;
    const firstQuestion = questions[0];

    setIndex(0);
    currentQuestionIndexRef.current = 0; // Initialize the ref
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
    console.log("Stopping voice interview");
    
    // Set the stopped flag immediately to prevent any further speech recognition
    isInterviewStoppedRef.current = true;
    
    // Stop speech synthesis immediately
    window.speechSynthesis.cancel();
    
    // Stop speech recognition immediately
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    
    // Clear timeouts immediately to prevent "I didn't hear anything" message
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    // Stop video stream
    if (userStream) {
      userStream.getTracks().forEach((track) => {
        track.stop();
      });
      setUserStream(null);
    }
    
    // Reset all states immediately
    setIsCameraOn(false);
    setIsInterviewing(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsPreparing(false);
    setCountdown(5);
    
    // Only complete the interview if we have answers
    if (Answers.length > 0) {
      setInterviewComplete(true);
      setResponse(Answers);
    }
  };

  // Helper function to calculate percentage based on analysis results
  const calculatePercentage = (answers) => {
    if (!answers || answers.length === 0) return 0;
    
    // If we have analysis results, use them to calculate score
    if (analysisResults.length > 0) {
      const totalPoints = analysisResults.reduce((sum, result) => {
        // Parse the analysis text to extract rating
        const analysisText = result.analysis || '';
        const ratingMatch = analysisText.match(/Rating:\s*(\d+)\/10/);
        const score = ratingMatch ? parseInt(ratingMatch[1]) : 7; // Default to 7 if no rating found
        console.log(`Question: ${result.question}, Score: ${score}/10`);
        return sum + score;
      }, 0);
      
      const totalPossiblePoints = analysisResults.length * 10; // 10 points per question
      const percentage = Math.round((totalPoints / totalPossiblePoints) * 100);
      console.log(`Total Points: ${totalPoints}, Total Possible: ${totalPossiblePoints}, Percentage: ${percentage}%`);
      return percentage;
    }
    
    // Default percentage based on number of questions answered
    return Math.round((answers.length / 5) * 80); // Assuming 5 questions, 80% base score
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
