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

  const totalScore = analysisResults.reduce((sum, q) => sum + (q.rating || 0), 0);
  const maxScore = analysisResults.length * 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  if (interviewComplete) {
    return (
      <div className="min-h-[calc(100dvh-80px)] py-6 w-full flex items-center justify-center bg-black">
        <div className="max-w-[1200px] lg:w-[80%] w-[97%] rounded-xl bg-[#040E1A] min-h-[80%] shadow-md shadow-blue-300 md:px-5 px-3 py-4">
          <Result percentage={percentage} questionsAndAnswers={analysisResults} />
        </div>
      </div>
    );
  }

  const PreInterviewUI = (
    <>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* User Box */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl aspect-video flex flex-col justify-end p-4">
          <h3 className="text-white font-semibold">{User?.displayName || "You"}</h3>
        </div>
        {/* AI Box */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl aspect-video flex flex-col justify-center items-center p-4">
          <img src="/assets/responseDp.png" alt="Nova AI" className="w-24 h-24 rounded-full mb-4" />
          <h3 className="text-white font-semibold">Nova</h3>
        </div>
      </div>
      {/* Transcript/Instructions Panel */}
      <div className="w-full md:w-80 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-4">Transcripts</h2>
        <div className="h-full flex flex-col items-center justify-center text-center">
            <img src="/assets/robot2.jpg" alt="illustration" className="w-32 h-32 mb-4" />
            <p className="text-gray-400">Click "Start Interview" to get started.</p>
            <p className="text-gray-400 mt-2 text-sm">You can skip a question or ask for a simpler one during the interview.</p>
        </div>
      </div>
    </>
  );

  const InterviewingUI = (
     <>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* User Box */}
        <div className={`bg-gray-900/50 backdrop-blur-sm border-2 rounded-2xl aspect-video flex flex-col justify-end p-4 ${isListening ? 'border-green-500' : 'border-gray-700'}`}>
           <h3 className="text-white font-semibold">{User?.displayName || "You"}</h3>
        </div>
        {/* AI Box */}
        <div className={`bg-gray-900/50 backdrop-blur-sm border-2 rounded-2xl aspect-video flex flex-col justify-center items-center p-4 ${isSpeaking ? 'border-blue-500' : 'border-gray-700'}`}>
          <img src="/assets/responseDp.png" alt="Nova AI" className="w-24 h-24 rounded-full mb-4" />
          <h3 className="text-white font-semibold">Nova</h3>
        </div>
      </div>
      {/* Transcript Panel */}
      <div className="w-full md:w-80 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">Transcript</h2>
         <div className="flex-grow overflow-y-auto custom-sidebar pr-2">
            {transcript.map((item, index) => (
              <div key={index} className={`my-3 ${item.speaker === 'user' ? 'text-right' : 'text-left'}`}>
                <p className="font-bold text-sm mb-1">{item.speaker === "ai" ? "Nova" : "You"}</p>
                <p className={`p-2 rounded-lg inline-block ${item.speaker === "ai" ? "bg-slate-700" : "bg-green-700"}`}>{item.text}</p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
         </div>
      </div>
    </>
  )

  return (
    <div className="h-[calc(100dvh-80px)] w-full flex flex-col items-center justify-between p-8 bg-black text-white relative overflow-hidden">
       {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-900/50 via-black to-black opacity-50 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-pink-900/50 via-black to-black opacity-50 blur-3xl"></div>

      {isPreparing ? (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
          <Timer sx={{ fontSize: 80, color: "#24FEEE" }} />
          <h1 className="text-4xl font-bold my-4">Get Ready!</h1>
          <p className="text-lg text-gray-300 mb-8">The interview will begin shortly.</p>
          <div className="text-8xl font-bold text-cyan-400 mb-8">{countdown}</div>
        </div>
      ) : null}
      
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center gap-8 z-10 flex-grow">
          {isInterviewing ? InterviewingUI : PreInterviewUI}
      </div>

      <div className="w-full flex items-center justify-center pt-8 z-10">
        {isInterviewing ? (
             <Button Click={stopVoiceInterview} text="End Interview" Class="!bg-red-600 !border-red-600" />
        ) : (
             questions?.length > 0 ? (
                <Button Click={startVoiceInterview} text="Start Interview" Class="!bg-blue-600 !border-blue-600" />
             ) : (
                <Button><Link to="/interview-form">Setup Interview</Link></Button>
             )
        )}
      </div>
    </div>
  );
};

export default InterviewQuestions;
