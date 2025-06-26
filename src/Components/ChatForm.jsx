import {
  SendRounded,
  BorderColorOutlined,
  StopCircleRounded,
  KeyboardVoiceRounded,
} from "@mui/icons-material";
import { useChatBotContext } from "../Context/ChatBotContext";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useState } from "react";

const ChatForm = () => {
  const {
    handleSend,
    currentMsg,
    handleInput,
    startNewChat,
    sendIcon,
    isChat,
    handleStop,
    showPauseIcon,
    setVoiceChat,
    setCurrentMsg,
  } = useChatBotContext();

  const [listening, setListening] = useState(false);

  // Placeholder file input handler
  const handleFileChange = (e) => {
    // Placeholder: just log the file(s)
    if (e.target.files && e.target.files.length > 0) {
      console.log("Selected files:", e.target.files);
      // Future: handle file upload/preview here
    }
  };

  // Speech-to-Text (Web Speech API)
  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentMsg(transcript);
      setListening(false);
    };
    recognition.onerror = (event) => {
      setListening(false);
      alert('Speech recognition error: ' + event.error);
    };
    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <div className="w-full h-[90px] flex items-center justify-between flex-col gap-2 px-2">
      <form
        onSubmit={handleSend}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex items-center justify-center lg:w-[80%] w-full gap-2 lg:gap-1">
          {/* File Upload Button removed */}
          <div className="relative w-full flex items-center">
            <input
              value={currentMsg}
              type="text"
              className={`w-full rounded-3xl lg:text-lg lg:h-[54px] h-[48px] lg:font-semibold text-white placeholder-gray-200 outline-none px-5 bg-[#040E1A] shadow-md shadow-gray-600 border-[1px] border-gray-100  ${
                showPauseIcon && "cursor-not-allowed"
              }`}
              placeholder="Enter your Prompt here."
              onChange={handleInput}
            />
          </div>
          {/* Existing Voice Chat Button (setVoiceChat) */}
          <KeyboardVoiceRounded
            onClick={() => setVoiceChat(true)}
            sx={{
              fontSize: { xs: 30, lg: 40 },
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.09)" },
            }}
            title="Start voice chat"
          />
          {showPauseIcon && (
            <StopCircleRounded
              onClick={handleStop}
              sx={{
                fontSize: { xs: 30, lg: 40 },
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.09)" },
              }}
            />
          )}
          {isChat && (
            <BorderColorOutlined
              onClick={startNewChat}
              sx={{
                fontSize: { xs: 30, lg: 40 },
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.09)" },
              }}
            />
          )}
          <button type="submit" disabled={showPauseIcon}>
            <SendRounded
              disabled={showPauseIcon}
              sx={{
                fontSize: { xs: 30, lg: 35 },
                display: sendIcon ? "block" : "none",
                cursor: showPauseIcon ? "not-allowed" : "pointer",
                opacity: showPauseIcon ? 0.3 : 1,
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.09)" },
              }}
            ></SendRounded>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatForm;
