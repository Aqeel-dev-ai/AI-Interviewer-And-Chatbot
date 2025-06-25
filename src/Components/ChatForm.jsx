import {
  SendRounded,
  BorderColorOutlined,
  StopCircleRounded,
  KeyboardVoiceRounded,
} from "@mui/icons-material";
import { useChatBotContext } from "../Context/ChatBotContext";
import AttachFileIcon from "@mui/icons-material/AttachFile";

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
  } = useChatBotContext();

  // Placeholder file input handler
  const handleFileChange = (e) => {
    // Placeholder: just log the file(s)
    if (e.target.files && e.target.files.length > 0) {
      console.log("Selected files:", e.target.files);
      // Future: handle file upload/preview here
    }
  };

  // Placeholder for speech-to-text (Web Speech API)
  const handleSpeechToText = () => {
    // Placeholder: simulate speech-to-text and set input
    // In real use, use Web Speech API and setCurrentMsg(transcript)
    console.log("Speech-to-text triggered");
    // Example: setCurrentMsg("Simulated voice input");
  };

  return (
    <div className="w-full h-[90px] flex items-center justify-between flex-col gap-2 px-2">
      <form
        onSubmit={handleSend}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex items-center justify-center lg:w-[80%] w-full gap-2 lg:gap-1">
          {/* Add Files Button */}
          <label className="flex items-center cursor-pointer px-2 py-1 rounded-lg hover:bg-[#232b47] transition-colors" title="Add files">
            <AttachFileIcon className="text-blue-400" />
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
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
            {/* Speech-to-Text Microphone Icon (writes to input) */}
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-[#232b47] hover:bg-blue-700 p-2 transition-colors"
              title="Speech to text"
              onClick={handleSpeechToText}
            >
              <KeyboardVoiceRounded className="text-blue-400" sx={{ fontSize: 24 }} />
            </button>
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
