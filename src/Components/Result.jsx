import React, { useState, useEffect } from "react";
import Button from "./Button";
import { Link, useLocation } from "react-router-dom";
import { useChatBotContext } from "../Context/ChatBotContext";
import { db } from "../utilities/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";

const Result = () => {
  const location = useLocation();
  const { startNewChat } = useChatBotContext();
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedResult, setFetchedResult] = useState(null);
  const { User } = useAuth();

  // Get data from navigation state
  const state = location.state || {};
  let percentage = state.percentage || 0;
  let questionsAndAnswers = state.questionsAndAnswers || [];
  let jobTitle = state.jobTitle || "Interview";
  let fromHistory = state.fromHistory || false;
  let fromInterview = state.fromInterview || false;

  // Fetch from DB if not present in state
  useEffect(() => {
    const fetchLatestInterview = async () => {
      if (!User || questionsAndAnswers.length > 0 || fromHistory) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "Interview"),
          where("UserId", "==", User.uid),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0].data();
          setFetchedResult(doc);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchLatestInterview();
    // eslint-disable-next-line
  }, [User]);

  if (fetchedResult) {
    questionsAndAnswers = fetchedResult.Result || [];
    jobTitle = fetchedResult.jobTitle || jobTitle;
    if (questionsAndAnswers.length > 0 && questionsAndAnswers[0].rating !== undefined) {
      const totalPoints = questionsAndAnswers.reduce((sum, qa) => sum + (qa.rating || 0), 0);
      const totalPossible = questionsAndAnswers.length * 10;
      percentage = Math.round((totalPoints / totalPossible) * 100);
    } else {
      percentage = questionsAndAnswers.length > 0 ? Math.round((questionsAndAnswers.length / 5) * 80) : 0;
    }
  }

  // If coming from interview history, extract data from interviewData
  if (fromHistory && state.interviewData) {
    const interviewData = state.interviewData;
    jobTitle = interviewData.jobTitle || "Interview";
    questionsAndAnswers = interviewData.Result || [];
    if (questionsAndAnswers.length > 0 && questionsAndAnswers[0].rating !== undefined) {
      const totalPoints = questionsAndAnswers.reduce((sum, qa) => sum + (qa.rating || 0), 0);
      const totalPossible = questionsAndAnswers.length * 10;
      percentage = Math.round((totalPoints / totalPossible) * 100);
    } else {
      percentage = questionsAndAnswers.length > 0 ? Math.round((questionsAndAnswers.length / 5) * 80) : 0;
    }
  }

  const progressColor = percentage >= 60 ? "#39FF14" : "#f87171";

  // Review lines based on performance
  let reviews = [];
  if (percentage >= 80) {
    reviews = [
      "Excellent performance! You are highly prepared for the role.",
      "Your answers demonstrate strong understanding and readiness.",
      "Keep up the great work!"
    ];
  } else if (percentage >= 60) {
    reviews = [
      "Good effort! You meet the requirements, but there's room for improvement.",
      "Review some key topics to boost your score further.",
      "Practice more for even better results."
    ];
  } else {
    reviews = [
      "Needs improvement! Consider reviewing the topics and trying again.",
      "Focus on understanding the core concepts.",
      "Don't give up—practice makes perfect!"
    ];
  }

  // Placeholder for full details (expand feature)
  const fullDetails = (
    <div className="w-full max-w-4xl bg-[#1e293b] rounded-xl p-6 shadow-inner mt-6">
      <h3 className="text-white text-xl font-semibold mb-4">Interview Results for: {jobTitle}</h3>
      <div className="mb-4 p-3 bg-[#232b47] rounded-lg">
        <div className="text-white text-lg font-semibold">Summary</div>
        <div className="text-gray-300">Total Questions: {questionsAndAnswers.length}</div>
        <div className="text-gray-300">Overall Score: {percentage}%</div>
      </div>
      <ul className="space-y-6">
        {questionsAndAnswers.length === 0 ? (
          <li className="text-white">No questions found.</li>
        ) : (
          questionsAndAnswers.map((qa, idx) => (
            <li key={idx} className="bg-[#232b47] rounded-lg p-4 text-white shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="font-semibold text-lg">Q{idx + 1}: {qa.question}</div>
                <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {qa.rating || 0}/10
                </div>
              </div>
              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-1">Your Answer:</div>
                <div className="text-blue-300 bg-[#1a2332] p-3 rounded border-l-4 border-blue-500">
                  {qa.answer}
                </div>
              </div>
              {qa.feedback && (
                <div className="mb-3">
                  <div className="text-sm text-gray-400 mb-1">Feedback:</div>
                  <div className="text-green-300 bg-[#1a2332] p-3 rounded border-l-4 border-green-500">
                    {qa.feedback}
                  </div>
                </div>
              )}
              {qa.correctAnswer && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Correct Answer:</div>
                  <div className="text-pink-300 bg-[#1a2332] p-3 rounded border-l-4 border-pink-500">
                    {qa.correctAnswer}
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-8 bg-[#040E1A]">
      {loading ? (
        <div className="text-white text-xl">Loading interview result...</div>
      ) : (
        <>
          <div
            className="relative flex items-center justify-center rounded-full h-52 w-52"
            style={{
              background: `conic-gradient(${progressColor} 0% ${percentage}%, #e5e7eb ${percentage}% 100%)`,
            }}
          >
            <div className="absolute text-4xl font-bold text-black">
              {percentage}%
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {reviews.map((line, idx) => (
              <p key={idx} className="md:text-lg text-base font-medium text-center text-white">
                {line}
              </p>
            ))}
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow mt-2"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? "Hide Details" : "View Full Details"}
          </button>
          {showDetails && fullDetails}
          <div className="flex flex-col md:flex-row items-center justify-center md:gap-9 gap-6">
            <Button>
              <Link to="/app">GoTo DashBoard</Link>
            </Button>
            <Button>
              <Link to="/interview-form">Restart Interview</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Result;
