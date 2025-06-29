import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { generateInterviewQuestion, analyzeAnswer } from "../utilities/Gemini";
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
  interviewTime: 30,
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
  const [interviewTime, setInterviewTime] = useState(30); // Default 30 minutes
  
  const speechTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentQuestionIndexRef = useRef(0);
  const isInterviewStoppedRef = useRef(false);
  const interviewStartTimeRef = useRef(null);
  const answersRef = useRef([]);

  useEffect(() => {
    answersRef.current = Answers;
  }, [Answers]);

  useEffect(() => {
    if (response) {
      console.log("[LOG] useEffect: Response received, saving to Firebase:", response);
      console.log("Current analysis results:", analysisResults);
      console.log("Job title:", jobTitle);
      console.log("User ID:", User.uid);
      
      // Combine answers with their analysis results
      const enrichedResponse = response.map((answer, index) => {
        const analysis = analysisResults[index];
        let rating = 0;
        let feedback = "";
        
        if (analysis && analysis.analysis) {
          // Parse the analysis text to extract rating and feedback
          const analysisText = analysis.analysis;
          const ratingMatch = analysisText.match(/Rating:\s*(\d+)\/10/);
          const feedbackMatch = analysisText.match(/Feedback:\s*(.+?)(?=\n|$)/);
          
          rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
          feedback = feedbackMatch ? feedbackMatch[1].trim() : "";
        }
        
        return {
          ...answer,
          rating,
          feedback
        };
      });
      
      console.log("[LOG] useEffect: Enriched response to be saved (should be full array):", enrichedResponse);
      addDoc(collection(db, "Interview"), {
        Result: enrichedResponse,
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
          
          // Navigate to Result page with the enriched interview data
          const percentage = calculatePercentage(enrichedResponse);
          console.log("Calculated percentage:", percentage);
          navigate("/result", {
            state: {
              percentage: percentage,
              questionsAndAnswers: enrichedResponse,
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
        if (!formData.JobTitle || !formData.Experience || !formData.resumeText || !formData.interviewTime) {
          throw new Error("Please provide a job title, experience level, interview duration, and a valid resume.");
        }
        jobDescription = `Job Title: ${formData.JobTitle}\nExperience: ${formData.Experience}\nResume Content: ${formData.resumeText}`;
        userDetailsPayload = {
          JobTitle: formData.JobTitle,
          Experience: formData.Experience,
          skills: ["Parsed from resume"],
        }
      } else {
        if (!formData.JobTitle || !formData.Experience || !value.length || !formData.interviewTime) {
          throw new Error("Please fill in all required fields including skills and interview duration");
        }
        jobDescription = `Job Title: ${formData.JobTitle}\nExperience: ${formData.Experience}\nSkills: ${value.join(", ")}`;
        userDetailsPayload = {
          ...formData,
          skills: value
        }
      }
      
      // Generate a pool of questions based on interview time
      // Generate more questions than needed to allow for natural flow
      const baseQuestionCount = Math.max(5, Math.round(formData.interviewTime / 5)); // At least 5 questions, more for longer interviews
      const questionPoolSize = Math.min(20, baseQuestionCount + 5); // Generate extra questions for flexibility
      
      console.log(`Interview time: ${formData.interviewTime} minutes, generating ${questionPoolSize} questions in pool`);
      
      setInterviewTime(formData.interviewTime);
      
      const questions = [];
      for (let i = 0; i < questionPoolSize; i++) {
        const question = await generateInterviewQuestion(jobDescription, questions, i);
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
          userDetails: userDetailsPayload,
          interviewTime: formData.interviewTime
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
    }, 15000); // Increased to 15 seconds for more patience

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
      }, 5000); // Increased to 5 seconds to wait for user to finish speaking
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
    // Use functional update to always append, never overwrite
    setAnswers(prevAnswers => {
      const updatedAnswers = [...prevAnswers, { question: currentQuestion, answer }];
      console.log("[LOG] Answers after setAnswers (functional):", updatedAnswers);
      return updatedAnswers;
    });
    try {
      const jobDescription = `Job Title: ${jobTitle}\nExperience: ${userdetail.Experience || userdetail.experience}\nSkills: ${userdetail.skills.join(", ")}`;
      const analysis = await analyzeAnswer(currentQuestion, answer, jobDescription);
      setAnalysisResults(prev => [...prev, {
        question: currentQuestion,
        answer,
        analysis
      }]);
      console.log("Answer analysis completed");
    } catch (error) {
      console.error("Error analyzing answer:", error);
    }
    console.log("Calling moveToNextQuestion");
    moveToNextQuestion(questionIndex);
  };
  
  const moveToNextQuestion = (currentIndex) => {
    console.log(`moveToNextQuestion called. Current index: ${currentIndex}, Total questions in pool: ${questions.length}`);
    console.log("[LOG] Current Answers in moveToNextQuestion:", Answers);
    
    // Check if interview time has elapsed
    const elapsedMinutes = (Date.now() - interviewStartTimeRef.current) / (1000 * 60);
    const timeRemaining = interviewTime - elapsedMinutes;
    
    console.log(`Interview time: ${elapsedMinutes.toFixed(1)} minutes elapsed, ${timeRemaining.toFixed(1)} minutes remaining`);
    
    // Only end interview when time limit is reached, not based on question count
    if (timeRemaining <= 1) {
      console.log("Interview complete - time limit reached");
      const endMessage = "Thank you. Your interview time has been reached. We are generating your results.";
      setTranscript((prev) => [...prev, { speaker: "ai", text: endMessage }]);
      speakText(endMessage, () => {
        // Stop the interview and wait for analysis to complete
        stopVoiceInterview();
        setInterviewComplete(true);
        
        // Wait a bit for any pending analysis to complete, then set response
        setTimeout(() => {
          console.log("[LOG] Setting response with answers (answersRef):", answersRef.current);
          console.log("[LOG] Setting response with answers (Answers):", Answers);
          setResponse(answersRef.current);
        }, 2000); // Wait 2 seconds for analysis to complete
      });
    } else {
      const nextIndex = currentIndex + 1;
      
      // If we've used all questions in the pool, generate more questions
      if (nextIndex >= questions.length) {
        console.log("Question pool exhausted, generating more questions");
        // For now, we'll end the interview if we run out of questions
        // In a more advanced implementation, we could generate more questions dynamically
        const endMessage = "Thank you. We've covered all the prepared questions. We are generating your results.";
        setTranscript((prev) => [...prev, { speaker: "ai", text: endMessage }]);
        speakText(endMessage, () => {
          stopVoiceInterview();
          setInterviewComplete(true);
          setTimeout(() => {
            console.log("[LOG] Setting response with answers (answersRef):", answersRef.current);
            console.log("[LOG] Setting response with answers (Answers):", Answers);
            setResponse(answersRef.current);
          }, 2000);
        });
        return;
      }
      
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
    const greeting = `Hello ${User?.displayName || 'there'}, welcome to your interview for the ${jobTitle} role. This interview will last ${interviewTime} minutes. Let's begin.`;
    const firstQuestion = questions[0];

    setIndex(0);
    currentQuestionIndexRef.current = 0; // Initialize the ref
    interviewStartTimeRef.current = Date.now(); // Record start time
    
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
      console.log("[LOG] stopVoiceInterview: Answers before setResponse:", Answers);
      setInterviewComplete(true);
      setResponse(answersRef.current);
    }
  };

  // Helper function to calculate percentage based on analysis results
  const calculatePercentage = (answers) => {
    if (!answers || answers.length === 0) return 0;
    
    // Calculate percentage based on individual answer ratings
    const totalPoints = answers.reduce((sum, answer) => {
      const rating = answer.rating || 0;
      console.log(`Question: ${answer.question}, Score: ${rating}/10`);
      return sum + rating;
    }, 0);
    
    const totalPossiblePoints = answers.length * 10; // 10 points per question
    const percentage = Math.round((totalPoints / totalPossiblePoints) * 100);
    console.log(`Total Points: ${totalPoints}, Total Possible: ${totalPossiblePoints}, Percentage: ${percentage}%`);
    return percentage;
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
        interviewTime,
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
