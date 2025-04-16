import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  userLastSeen: {},
  typingUsers: {},
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateProfilePicture: async (imageData) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile-picture", { image: imageData });
      set({ authUser: res.data });
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.log("error in update profile picture:", error);
      toast.error(error.response?.data?.message || "Failed to update profile picture");
      throw error;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("userLastSeen", (lastSeenData) => {
      set((state) => ({
        userLastSeen: {
          ...state.userLastSeen,
          ...lastSeenData
        }
      }));
    });

    socket.on("userOnlineStatus", ({ userId, isOnline }) => {
      set((state) => {
        const newOnlineUsers = isOnline
          ? [...new Set([...state.onlineUsers, userId])]
          : state.onlineUsers.filter(id => id !== userId);
        return { onlineUsers: newOnlineUsers };
      });
    });

    socket.on("typingStatus", ({ senderId, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [senderId]: isTyping
        }
      }));
    });

    socket.io.on("reconnect", () => {
      console.log("Reconnected to socket server");
      if (authUser) {
        socket.emit("userReconnected", { userId: authUser._id });
      }
    });

    socket.io.on("reconnect_error", () => {
      console.log("Reconnection error");
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  isRecentlyOffline: (userId) => {
    const lastSeen = get().userLastSeen[userId];
    if (!lastSeen) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastSeen > fiveMinutesAgo;
  },

  getLastSeenTime: (userId) => {
    return get().userLastSeen[userId];
  },

  setTypingStatus: (receiverId, isTyping) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("typing", { receiverId, isTyping });
    }
  },

  isUserTyping: (userId) => {
    return get().typingUsers[userId] || false;
  },
}));
