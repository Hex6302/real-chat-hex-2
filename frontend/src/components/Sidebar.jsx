import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, LogOut, Settings, Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const Sidebar = () => {
  const { conversations, selectedUser, setSelectedUser } = useChatStore();
  const { currentUser, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants[0].fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-base-100 border-r border-base-300">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img src={currentUser.profilePic} alt="avatar" />
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-base">{currentUser.fullName}</h2>
              <p className="text-xs text-base-content/70">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10 text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation._id}
            onClick={() => setSelectedUser(conversation.participants[0])}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedUser?._id === conversation.participants[0]._id
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200"
            }`}
          >
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img
                  src={conversation.participants[0].profilePic}
                  alt="avatar"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {conversation.participants[0].fullName}
              </h3>
              <p className="text-xs text-base-content/70 truncate">
                {conversation.lastMessage?.message || "No messages yet"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-base-content/70">
                {conversation.lastMessage
                  ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                conversation.participants[0].status === "online" ? "bg-green-500" :
                conversation.participants[0].status === "offline" ? "bg-red-500" :
                "bg-blue-500"
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
