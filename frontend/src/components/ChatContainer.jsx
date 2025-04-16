import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCheck, MoreVertical, Settings, Trash2, MessageSquareX, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";
import { format } from "date-fns";

import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import Message from "./Message";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteChat,
    clearChat,
  } = useChatStore();
  const { authUser, isUserTyping, onlineUsers, isRecentlyOffline } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear this chat?")) {
      await clearChat(selectedUser._id);
      setShowOptions(false);
    }
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedMessages.length} message(s)?`)) {
      try {
        await Promise.all(selectedMessages.map(messageId => 
          deleteChat(selectedUser._id, messageId)
        ));
        setSelectedMessages([]);
        setIsSelecting(false);
      } catch (error) {
        console.error("Error deleting messages:", error);
      }
    }
  };

  const handleSettings = () => {
    navigate("/settings");
    setShowOptions(false);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.options-menu')) {
        setShowOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptions]);

  const getStatusDot = () => {
    if (onlineUsers.includes(selectedUser._id)) {
      return <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>;
    } else if (isRecentlyOffline(selectedUser._id)) {
      return <div className="w-2 h-2 rounded-full bg-info"></div>;
    } else {
      return <div className="w-2 h-2 rounded-full bg-error"></div>;
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-3 sm:p-4">
          <button 
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4 sm:size-6" />
            <span className="text-sm sm:text-base">Back to chats</span>
          </button>
        </div>
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-base-300 bg-base-100 z-10">
        <div className="flex items-center gap-2">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img src={selectedUser.profilePic} alt="profile" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-base">{selectedUser.fullName}</h3>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                selectedUser.status === "online" ? "bg-green-500" :
                selectedUser.status === "offline" ? "bg-red-500" :
                "bg-blue-500"
              }`}></div>
              <span className="text-xs text-base-content/70">
                {selectedUser.status === "online" ? "Online" :
                 selectedUser.status === "offline" ? "Offline" :
                 "Recently offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100"
      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.senderId === authUser._id ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] md:max-w-[60%] lg:max-w-[50%] ${
              message.senderId === authUser._id ? "bg-primary text-primary-content" : "bg-base-200"
            } rounded-lg p-3`}>
              {message.image && (
                <div className="mb-2">
                  <img 
                    src={message.image} 
                    alt="message" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              <p className="text-sm md:text-base break-words">{message.message}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {format(new Date(message.createdAt), "h:mm a")}
              </span>
            </div>
          </div>
        ))}
        {isUserTyping(selectedUser._id) && (
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                <img src={selectedUser.profilePic} alt="profile" />
              </div>
            </div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-base-300 bg-base-100 z-10">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;

