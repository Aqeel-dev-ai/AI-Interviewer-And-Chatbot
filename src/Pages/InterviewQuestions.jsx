import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useInterviewContext } from "../Context/InterviewContext";
import { useAuth } from "../Context/AuthContext";
import Result from "../Components/Result";
import Button from "../Components/Button";
import { RecordVoiceOver, Hearing, GraphicEq, Timer } from "@mui/icons-material";

const InterviewQuestions = () => {
  const {
    questions,
    interviewComplete,
    analysisResults,
    startVoiceInterview,
    isInterviewing,
    isListening,
    isSpeaking,
    transcript,
    stopVoiceInterview,
    isPreparing,
    countdown,
  } = useInterviewContext();
  const { User } = useAuth();
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const totalScore =
    analysisResults.reduce((sum, q) => sum + (q.rating || 0), 0);
  const maxScore = analysisResults.length * 10;
  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  if (interviewComplete) {
    return (
      <div className="min-h-[calc(100dvh-80px)] py-6 w-full flex items-center justify-center">
        <div className="max-w-[1200px] lg:w-[80%] w-[97%] rounded-xl bg-[#040E1A] min-h-[80%] shadow-md shadow-blue-300 md:px-5 px-3 py-4">
          <Result percentage={percentage} questionsAndAnswers={analysisResults} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-80px)] w-full flex items-center justify-center">
      <div className="max-w-[1200px] lg:w-[80%] w-[97%] rounded-xl bg-[#040E1A] h-[calc(100vh-120px)] shadow-md shadow-blue-300 md:px-5 px-3 py-4 flex flex-col">
        {isPreparing ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-white p-4">
            <Timer sx={{ fontSize: 80, color: "#24FEEE" }} />
            <h1 className="text-4xl font-bold my-4">Get Ready!</h1>
            <p className="text-lg text-gray-300 mb-8">
              The interview will begin shortly. Take a deep breath and focus.
            </p>
            <div className="text-8xl font-bold text-cyan-400 mb-8">
              {countdown}
            </div>
            <p className="text-lg text-gray-300">
              Prepare to answer the first question.
            </p>
          </div>
        ) : isInterviewing ? (
          <>
            <div className="flex-grow overflow-y-auto custom-sidebar pr-4">
              {transcript.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 my-4 ${
                    item.speaker === "user" ? "justify-end" : ""
                  }`}
                >
                  {item.speaker === "ai" && (
                    <div className="bg-blue-500 p-2 rounded-full">
                      <RecordVoiceOver />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-lg max-w-[80%] ${
                      item.speaker === "ai"
                        ? "bg-slate-700 text-white"
                        : "bg-green-700 text-white"
                    }`}
                  >
                    <p className="font-bold mb-1">
                      {item.speaker === "ai" ? "Talently" : User?.displayName || "You"}
                    </p>
                    <p>{item.text}</p>
                  </div>
                   {item.speaker === "user" && (
                    <div className="bg-green-500 p-2 rounded-full">
                      <img src={User?.photoURL} alt="user" className="w-6 h-6 rounded-full" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
            <div className="flex-shrink-0 h-20 flex items-center justify-center gap-4">
              {isSpeaking && (
                <div className="flex items-center gap-2 text-blue-300">
                  <GraphicEq />
                  <span>Nova is speaking...</span>
                </div>
              )}
              {isListening && (
                <div className="flex items-center gap-2 text-green-300">
                  <Hearing />
                  <span>Listening for your answer...</span>
                </div>
              )}
               <Button Click={stopVoiceInterview} text="End Interview" Class="!bg-red-600 !border-red-600" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-8">
            {questions?.length > 0 ? (
              <>
                <h1 className="text-3xl font-bold text-white text-center">
                  Ready to Start Your Voice Interview?
                </h1>
                <p className="text-lg text-gray-300 text-center">
                  Click the button below to begin. The interviewer will ask you
                  questions, and you can respond with your voice.
                </p>
                <Button Click={startVoiceInterview} text="Start Interview" Class="!text-white"/>
              </>
            ) : (
              <div className="w-full h-full lg:px-20 flex items-center justify-center flex-col gap-8 py-5">
                <p className="lg:text-3xl text-xl font-semibold text-center text-white">
                  Interview questions currently unavailable.
                </p>
                <p className="text-lg text-gray-300 text-center">
                  Please fill out the form to generate questions first.
                </p>
                <Button>
                  <Link to="/interview-form">Go to Form</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestions;
