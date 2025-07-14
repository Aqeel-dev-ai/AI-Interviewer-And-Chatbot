
import { useEffect, useState } from "react";
import { useChatBotContext } from "../Context/ChatBotContext";
import Loader from "./Loader";
import { useAuth } from "../Context/AuthContext";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../utilities/firebase";

const Sidebar = ({ sidebarOpen, setSidebarOpen, handleSidebarToggle }) => {
  const {
    history,
    fetchChatSessions,
    fetchChatSession,
    setIsChat,
    fetchedHistory,
    setSelectedResult,
    startNewChat,
  } = useChatBotContext();
  const { User, setError } = useAuth();

  const [Interviews, setInterviews] = useState([]);

  const handleHistory = (id) => {
    fetchChatSession(id);
    setIsChat(true);
  };

  const handleInterviewHistory = (id, result) => {
    setIsChat(true);
    setSelectedResult(result);
  };

  const fetchInterview = async () => {
    try {
      const q = query(
        collection(db, "Interview"),
        where("UserId", "==", User.uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const interviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInterviews(interviewsData);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    console.log("Sidebar useEffect - User:", User?.uid);
    if (User?.uid) {
      console.log("Calling fetchChatSessions from Sidebar");
      fetchChatSessions();
      fetchInterview();
    }
  }, [User]);

  return (
    <>
      <div
        className={`pointer-events-auto h-screen w-[225px] shadow-2xl shadow-black bg-[#081229] rounded-lg absolute z-[1061] py-3 transition-all duration-300 ease-in-out top-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ left: 0 }}
      >
        {/* Logo and App Name */}
        <div className="sticky top-0 z-10 bg-[#081229] flex flex-col gap-2 px-4 pb-2 border-b border-[#232b47]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-wide truncate">NOVA Chatbot</span>
          </div>
          {/* New Chat Button (adjusted size for sidebar width) */}
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition-colors mt-2 flex items-center justify-center"
            onClick={startNewChat}
          >
            <span className="truncate">+ New chat</span>
          </button>
        </div>
        {/* Chat History Section */}
        <div className="w-full flex-1 flex flex-col pl-3 pr-2 overflow-y-auto custom-sidebar">
          <h1 className="text-lg font-bold text-slate-100 mb-2">Chat History</h1>
          <div className="flex-1 overflow-y-auto">
            {history.length > 0 ? (
              history.map((session) => (
                <div
                  className="w-full hover:cursor-pointer hover:bg-[#18274a] mb-2 rounded-lg py-1 px-2 flex items-center truncate"
                  key={session.id}
                  onClick={() => handleHistory(session.id)}
                >
                  <p className="text-base font-medium truncate">
                    {session.messages[0]?.Prompt.slice(0, 20)}...
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full w-full flex items-center justify-center text-base font-semibold flex-col gap-5">
                {fetchedHistory ? <Loader /> : "No History Available Yet."}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
