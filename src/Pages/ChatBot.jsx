import { useChatBotContext } from "../Context/ChatBotContext";
import ChatList from "../Components/ChatList";
import ChatForm from "../Components/ChatForm";
import Result from "../Components/Result";
import VoiceChat from "../Components/VoiceChat";

const ChatBot = () => {
  const { isChat, userName, fetchUserName, selectedResult, voiceChat } =
    useChatBotContext();

  return (
    <div className="h-[calc(100dvh-80px)]  w-full flex items-center justify-center">
      <div className="h-full w-full lg:w-[1000px] 2xl:w-[1200px] flex flex-col">
        {voiceChat ? (
          <VoiceChat />
        ) : (
          <>
            <div className="flex-grow w-full h-full overflow-y-auto scroll-smooth chat-Div">
              {!isChat && (
                <div className="w-full h-full flex items-center justify-center flex-col gap-4 px-2">
                  <h2 className="2xl:text-5xl font-bold text-4xl text-center">
                    Hi 👏 {fetchUserName ? "User" : userName}
                  </h2>
                  <h4 className="2xl:text-4xl font-semibold text-3xl text-center">
                    How can I help you today?
                  </h4>
                </div>
              )}
              {selectedResult ? (
                <Result percentage={selectedResult} />
              ) : (
                <ChatList userName={userName} />
              )}
            </div>
            <ChatForm />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
