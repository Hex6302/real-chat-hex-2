import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, Smile } from "lucide-react";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { currentUser } = useAuthStore();

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !fileInputRef.current?.files?.[0]) return;

    const formData = new FormData();
    formData.append("message", message);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    await sendMessage(formData);
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsTyping(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMessage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 bg-base-200 rounded-full px-4 py-2">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none outline-none text-sm md:text-base"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <Image className="size-4 md:size-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-circle"
        disabled={!message.trim() && !fileInputRef.current?.files?.[0]}
      >
        <Send className="size-4 md:size-5" />
      </button>
    </form>
  );
};

export default MessageInput;
