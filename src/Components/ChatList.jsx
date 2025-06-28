import React, { useEffect, useRef } from "react";
import { useChatBotContext } from "../Context/ChatBotContext";
import ResponseLoading from "./ResponseLoading";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/github-dark.css';

const ChatList = ({ userName }) => {
  const { Chat, FetchingData } = useChatBotContext();
  const chatRef = useRef(null);
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Chat]);

  // Function to detect if content contains MCQ patterns
  const isMCQContent = (content) => {
    const mcqPatterns = [
      /^Question:\s/m, // Questions starting with "Question:"
      /^\d+\.\s*[A-Z]/m, // Numbered questions starting with A, B, C, D
      /^[A-D]\)\s/m, // Options like A), B), C), D)
      /^[A-D]\.\s/m, // Options like A., B., C., D.
      /^Question\s*\d+/im, // Questions starting with "Question"
      /^MCQ/i, // Content starting with MCQ
    ];
    return mcqPatterns.some(pattern => pattern.test(content));
  };

  // Custom MCQ renderer
  const renderMCQContent = (content) => {
    const lines = content.split('\n');
    const renderedLines = lines.map((line, index) => {
      // Question pattern with "Question:" prefix
      if (/^Question:\s/.test(line)) {
        return (
          <div key={index} className="mb-3">
            <h3 className="text-lg font-semibold mb-2">{line}</h3>
          </div>
        );
      }
      // Question pattern with numbers
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={index} className="mb-3">
            <h3 className="text-lg font-semibold mb-2">{line}</h3>
          </div>
        );
      }
      // Option patterns
      if (/^[A-D][\)\.]\s/.test(line)) {
        return (
          <div key={index} className="ml-6 mb-2">
            <span className="font-medium">{line.split(' ')[0]}</span>
            <span className="ml-2">{line.substring(line.indexOf(' ') + 1)}</span>
          </div>
        );
      }
      // Answer pattern with checkmark
      if (/^✅\s*Answer:\s*[A-D]/i.test(line)) {
        return (
          <div key={index} className="ml-6 mb-3">
            <span className="font-semibold">{line}</span>
          </div>
        );
      }
      // Answer pattern without checkmark (fallback)
      if (/^Answer:\s*[A-D]/i.test(line)) {
        return (
          <div key={index} className="ml-6 mb-3">
            <span className="font-semibold">✅ {line}</span>
          </div>
        );
      }
      // Regular text
      return <p key={index} className="mb-2">{line}</p>;
    });
    return <div className="mcq-container">{renderedLines}</div>;
  };

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
                <div className="bg-gray-800 text-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-md text-[16px] break-words w-full markdown-body">
                  {isMCQContent(msg.Response) ? (
                    renderMCQContent(msg.Response)
                  ) : (
                    <ReactMarkdown
                      children={msg.Response || "No Response From Api Please try later."}
                      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                      components={{
                        code({node, inline, className, children, ...props}) {
                          return !inline ? (
                            <pre className="bg-[#232b47] rounded-lg p-3 overflow-x-auto my-2"><code className={className} {...props}>{children}</code></pre>
                          ) : (
                            <code className="bg-[#232b47] px-1 rounded text-pink-400" {...props}>{children}</code>
                          );
                        },
                        table({children}) {
                          return <table className="min-w-full border border-gray-600 my-2">{children}</table>;
                        },
                        th({children}) {
                          return <th className="border border-gray-600 px-2 py-1 bg-[#232b47]">{children}</th>;
                        },
                        td({children}) {
                          return <td className="border border-gray-600 px-2 py-1">{children}</td>;
                        },
                        ul({children}) {
                          return <ul className="list-disc ml-6 my-2">{children}</ul>;
                        },
                        ol({children}) {
                          return <ol className="list-decimal ml-6 my-2">{children}</ol>;
                        },
                        li({children}) {
                          return <li className="mb-1">{children}</li>;
                        },
                        strong({children}) {
                          return <strong className="font-bold text-white">{children}</strong>;
                        },
                        em({children}) {
                          return <em className="italic text-gray-300">{children}</em>;
                        },
                        p({children}) {
                          return <p className="mb-2 leading-relaxed">{children}</p>;
                        },
                        h1({children}) {
                          return <h1 className="text-2xl font-bold text-blue-300 mb-3">{children}</h1>;
                        },
                        h2({children}) {
                          return <h2 className="text-xl font-bold text-blue-300 mb-2">{children}</h2>;
                        },
                        h3({children}) {
                          return <h3 className="text-lg font-bold text-blue-300 mb-2">{children}</h3>;
                        },
                        blockquote({children}) {
                          return <blockquote className="border-l-4 border-blue-500 pl-4 bg-[#1a2332] py-2 my-2 italic">{children}</blockquote>;
                        },
                      }}
                    />
                  )}
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
