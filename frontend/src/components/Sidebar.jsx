import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, isRecentlyOffline } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) {
    return (
      <div className="h-full flex flex-col bg-base-100">
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Users className="size-5" />
              <span className="text-base font-semibold">Chats</span>
            </div>
          </div>
        </div>
        <SidebarSkeleton />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-base-100">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <span className="text-base font-semibold">Chats</span>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs"
            />
            <span className="text-sm">Show online only</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    w-full p-3 flex items-center gap-3 rounded-xl
                    hover:bg-base-200 active:bg-base-300 transition-colors
                    ${selectedUser?._id === user._id ? "bg-base-200 ring-2 ring-primary ring-opacity-50" : ""}
                  `}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{user.fullName}</div>
                      {onlineUsers.includes(user._id) ? (
                        <span className="size-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
                      ) : isRecentlyOffline(user._id) ? (
                        <span className="size-2 bg-blue-500 rounded-full flex-shrink-0" />
                      ) : (
                        <span className="size-2 bg-red-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {onlineUsers.includes(user._id)
                        ? "Online"
                        : isRecentlyOffline(user._id)
                        ? "Recently offline"
                        : "Offline"}
                    </div>
                  </div>

                  {user.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="badge badge-primary">{user.unreadCount}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-base-content/60">
              {showOnlineOnly ? "No online users" : "No users found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
