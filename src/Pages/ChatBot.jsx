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
  const { isChat, userName, fetchUserName, selectedResult, voiceChat } = useChatBotContext();
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
    <div className="flex h-screen bg-[#040E1A] text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className="flex flex-col bg-[#081229] border-r border-[#232b47] w-[240px] h-[calc(100vh-80px)] z-30 overflow-y-auto overflow-x-hidden fixed top-[80px] left-0"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#232b47]">
          <img src="/assets/Logo.webp" alt="Logo" className="h-8 w-8" />
          <span className="text-white font-semibold text-lg">Nova</span>
        </div>
        <Sidebar sidebarOpen={true} setSidebarOpen={() => {}} handleSidebarToggle={() => {}} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-[calc(100vh-80px)]" style={{ marginLeft: `${SIDEBAR_WIDTH}px` }}>
        {/* Chat Section */}
        <div className="flex-1 overflow-y-auto px-2 py-4 scroll-smooth chat-Div">
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

        {/* Chat Input */}
        <div className="h-[90px] flex-shrink-0 border-t border-[#232b47] bg-[#081229] w-full">
          <ChatForm />
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
