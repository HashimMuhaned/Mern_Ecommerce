// context/ChatContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { CheckUserContext } from "../context/CheckUserToken";
import axios from "axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useContext(CheckUserContext);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (userInfo?._id && userInfo?.fname && messages.length === 0) {
      const url = `mern-ecommerce-chatbot-722ommt2v-hashims-projects-1d68b3df.vercel.app/chat_boot?user_id=${userInfo._id}&fname=${userInfo.fname}`;

      axios
        .get(url)
        .then((res) => {
          const filtered = res.data.messages.filter(
            (m) => m.role === "ai" || m.role === "user" // show only AI and real user messages
          );

          // Map to your frontend format, but exclude system and fake user messages
          const loaded = filtered.map((m, i) => ({
            id: i,
            content: m.content,
            isUser: m.role === "user",
            type: "message",
          }));

          setMessages(loaded.reverse()); // or loaded as-is depending on your display order
        })
        .catch((err) => {
          console.error("Greeting boot error:", err.message);
          setError("Failed to greet or load history.");
        });
    }
  }, [userInfo]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
