import React, { useState } from "react";
import Button from "./Button";
import { Link, useLocation } from "react-router-dom";
import { useChatBotContext } from "../Context/ChatBotContext";

const Result = ({ percentage, questionsAndAnswers = [] }) => {
  console.log('Percentage:', percentage, 'Details:', questionsAndAnswers);
  const progressColor = percentage >= 60 ? "#39FF14" : "#f87171";
  const URL = useLocation();
  const { startNewChat } = useChatBotContext();
  const [showDetails, setShowDetails] = useState(false);

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
    <div className="w-full max-w-2xl bg-[#1e293b] rounded-xl p-6 shadow-inner mt-6">
      <ul className="space-y-6">
        {questionsAndAnswers.length === 0 ? (
          <li className="text-white">No questions found.</li>
        ) : (
          questionsAndAnswers.map((q, idx) => (
            <li key={idx} className="bg-[#232b47] rounded-lg p-4 text-white shadow flex flex-col gap-2">
              <div className="font-semibold">Q{idx + 1}: {q.question}</div>
              <div className="text-base pl-2">Your answer: <span className="font-medium text-blue-300">{q.answer}</span></div>
              <div className="text-base pl-2">Rating: <span className="font-medium text-yellow-300">{q.rating || 0}/10</span></div>
              {q.feedback && (
                <div className="text-base pl-2">Feedback: <span className="font-medium text-green-300">{q.feedback}</span></div>
              )}
              {q.correctAnswer && (
                <div className="text-base pl-2">Correct Answer: <span className="font-medium text-pink-300">{q.correctAnswer}</span></div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full py-2 gap-8">
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
        {URL.pathname === "/app" && (
          <Button Click={startNewChat} text={"Start Chat"}></Button>
        )}
        {URL.pathname !== "/app" && (
          <Button>
            <Link to="/app">GoTo DashBoard</Link>
          </Button>
        )}
        <Button>
          <Link to="/interview-form">Restart Interview</Link>
        </Button>
      </div>
    </div>
  );
};

export default Result;
