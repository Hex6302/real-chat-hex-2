import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCheck, MoreVertical, Settings, Trash2, MessageSquareX, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import Message from "./Message";
import MessageSkeleton from "./skeletons/MessageSkeleton";

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.options-menu')) {
        setShowOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptions]);

  if (isMessagesLoading) {
    return (
      <div className="fixed inset-0 flex flex-col bg-base-100">
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-3">
          <button 
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">Back to chats</span>
          </button>
        </div>
        <MessageSkeleton />
      </div>
    );
  }

  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-base-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedUser(null);
              setSelectedMessages([]);
              setIsSelecting(false);
            }}
            className="btn btn-ghost btn-sm md:hidden"
          >
            <ArrowLeft className="size-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img src={selectedUser.profilePic} alt="avatar" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedUser.fullName}</span>
                <div className={`w-2 h-2 rounded-full ${
                  onlineUsers.includes(selectedUser._id) ? 'bg-green-500 animate-pulse' :
                  isRecentlyOffline(selectedUser._id) ? 'bg-blue-500' :
                  'bg-red-500'
                }`}></div>
              </div>
              {isUserTyping(selectedUser._id) && (
                <div className="flex items-center gap-1 text-xs text-base-content/70">
                  <span>typing</span>
                  <span className="flex gap-0.5">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="flex items-center gap-2">
          {isSelecting && (
            <div className="flex items-center gap-2 bg-base-200 px-3 py-1.5 rounded-lg">
              <span className="text-sm font-medium">{selectedMessages.length} selected</span>
              <div className="h-4 w-px bg-base-300"></div>
              <button
                onClick={handleDeleteSelectedMessages}
                className="btn btn-error btn-sm btn-circle"
                disabled={selectedMessages.length === 0}
              >
                <Trash2 className="size-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedMessages([]);
                  setIsSelecting(false);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
          <div className="relative options-menu">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="btn btn-ghost btn-sm"
            >
              <MoreVertical className="size-4" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-lg border border-base-300 z-50">
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => {
                        setIsSelecting(true);
                        setShowOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2"
                    >
                      <Trash2 className="size-4" />
                      <span>Select Messages to Delete</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleClearChat}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2"
                    >
                      <MessageSquareX className="size-4" />
                      <span>Clear Chat</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleSettings}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2"
                    >
                      <Settings className="size-4" />
                      <span>Settings</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-base-100"
      >
        {messages.map((message) => (
          <Message 
            key={message._id} 
            message={message} 
            isSelecting={isSelecting}
            isSelected={selectedMessages.includes(message._id)}
            onSelect={() => toggleMessageSelection(message._id)}
          />
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 z-10 bg-base-100 border-t border-base-300">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="input input-bordered flex-1"
            />
            <button className="btn btn-primary">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;

