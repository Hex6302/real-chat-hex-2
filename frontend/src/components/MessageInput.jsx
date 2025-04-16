import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const MessageInput = () => {
  const { selectedUser, sendMessage } = useChatStore();
  const { authUser, setTypingStatus } = useAuthStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = () => {
    if (!selectedUser) return;

    if (!isTyping) {
      setIsTyping(true);
      setTypingStatus(selectedUser._id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingStatus(selectedUser._id, false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    try {
      await sendMessage({ text, image });
      setText("");
      setImage(null);
      setIsTyping(false);
      setTypingStatus(selectedUser._id, false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!selectedUser) return null;

  return (
    <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
      {image && (
        <div className="relative w-32 h-32">
          <img
            src={image}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 btn btn-circle btn-sm bg-base-100"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="input input-bordered flex-1 text-sm sm:text-base"
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-sm sm:btn-md"
        >
          <Image className="size-4 sm:size-5" />
        </button>
        
        <button
          type="submit"
          disabled={!text.trim() && !image}
          className="btn btn-primary btn-sm sm:btn-md"
        >
          <Send className="size-4 sm:size-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
