import React, { useState, useEffect, useRef } from "react";
import { useChatBotContext } from "../Context/ChatBotContext";
import ChatList from "../Components/ChatList";
import ChatForm from "../Components/ChatForm";
import Result from "../Components/Result";
import VoiceChat from "../Components/VoiceChat";
import Sidebar from "../Components/Sidebar";

const NAVBAR_HEIGHT = 80;
const CHAT_INPUT_HEIGHT = 90;
const SIDEBAR_WIDTH = 240;

const ChatBot = () => {
  const { isChat, userName, fetchUserName, selectedResult, voiceChat, selectedModel, setSelectedModel } = useChatBotContext();
  const [sidebarOpen] = useState(true); // fixed open sidebar
  const chatEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="flex bg-[#040E1A] text-white overflow-hidden h-full">
      {/* Sidebar */}
      <div
        className="flex flex-col bg-[#081229] border-r border-[#232b47] w-[240px] h-full z-30 overflow-y-auto overflow-x-hidden fixed top-[80px] left-0"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#232b47]">
          <img src="/assets/Logo.webp" alt="Logo" className="h-8 w-8" />
          <span className="text-white font-semibold text-lg">Nova</span>
        </div>
        <Sidebar sidebarOpen={true} setSidebarOpen={() => {}} handleSidebarToggle={() => {}} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full" style={{ marginLeft: `${SIDEBAR_WIDTH}px` }}>
        {/* Chat Message Section - fixed area between navbar and chat input */}
        <div
          className="absolute"
          style={{
            top: `${NAVBAR_HEIGHT}px`,
            left: `${SIDEBAR_WIDTH}px`,
            right: 0,
            bottom: '90px',
            overflowY: 'auto',
            padding: '16px 8px',
            scrollBehavior: 'smooth',
          }}
        >
          {voiceChat ? (
            <VoiceChat />
          ) : !isChat ? (
            <div className="w-full h-full flex items-center justify-center flex-col gap-4 px-2">
              <h2 className="2xl:text-5xl font-bold text-4xl text-center">Hi 👏 {fetchUserName ? "User" : userName}</h2>
              <h4 className="2xl:text-4xl font-semibold text-3xl text-center">How can I help you today?</h4>
            </div>
          ) : selectedResult ? (
            <Result percentage={selectedResult} />
          ) : (
            <ChatList userName={userName} />
          )}
          <div ref={chatEndRef}></div>
        </div>
      </div>

      {/* Chat Input - fixed at bottom, right of sidebar */}
      <div
        className="fixed bottom-0 left-[240px] z-40 w-[calc(100vw-240px)] border-t border-[#232b47] bg-[#081229] shadow-lg flex items-center justify-center"
        style={{ height: '90px' }}
      >
        <div className="w-full max-w-5xl mx-auto flex items-center justify-center h-full">
          {/* Model selection dropdown */}
          <div className="mb-6 flex flex-col items-center">
            <label htmlFor="chatbot-model-select" className="w-40 text-white font-semibold mb-2">Select AI Model</label>
            <select
              id="chatbot-model-select"
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-700 bg-[#232b47] text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </div>
          <ChatForm />
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
