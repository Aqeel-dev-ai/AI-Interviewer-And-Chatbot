import React, { useEffect, useRef } from "react";
import { useChatBotContext } from "../Context/ChatBotContext";
import ResponseLoading from "./ResponseLoading";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const ChatList = ({ userName }) => {
  const { Chat, FetchingData } = useChatBotContext();
  const chatRef = useRef(null);
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Chat]);
  return (
    <div className="flex flex-col gap-3 w-full">
      {Chat.map((msg, index) => (
        <React.Fragment key={index}>
          {/* User Message */}
          <div className="flex w-full justify-end">
            <div className="flex items-end gap-2 max-w-[80%]">
              <div className="flex flex-col items-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2 shadow-md text-[16px] break-words">
                  {msg.Prompt}
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-white">
                <PersonIcon fontSize="small" />
              </div>
            </div>
          </div>
          {/* Bot Message */}
          {msg.Response && (
            <div className="flex w-full justify-start">
              <div className="flex items-end gap-2 max-w-[80%]">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                  <SmartToyIcon fontSize="small" />
                </div>
                <div className="bg-gray-800 text-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-md text-[16px] break-words">
                  {msg.Response || "No Response From Api Please try later."}
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
      {FetchingData && <ResponseLoading />}
      <div ref={chatRef}></div>
    </div>
  );
};

export default ChatList;
