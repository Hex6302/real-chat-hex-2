import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  // Add mobile-specific layout handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // Desktop
        document.body.classList.remove('mobile-chat-open');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Show navbar only when no chat is selected */}
      {!selectedUser && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}

      {/* Main content - adjust padding when navbar is visible */}
      <div className={`min-h-screen ${!selectedUser ? 'pt-16' : ''}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-full">
            {/* Sidebar - only shown when no chat is selected */}
            {!selectedUser && (
              <div className="h-full">
                <Sidebar />
              </div>
            )}

            {/* Chat Container - full width when chat is selected */}
            <div className="h-full">
              {selectedUser ? <ChatContainer /> : <NoChatSelected />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
