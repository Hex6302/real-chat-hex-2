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
    <div className="h-screen bg-base-200">
      {/* Show navbar only when no chat is selected */}
      {!selectedUser && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}

      {/* Main content - adjust padding when navbar is visible */}
      <div className={`h-full ${!selectedUser ? 'pt-16' : ''}`}>
        <div className="h-full bg-base-100">
          <div className="h-full relative flex">
            {/* Sidebar - hidden on mobile when chat is open */}
            <div className={`
              h-full w-full md:w-80 lg:w-96
              ${selectedUser ? 'hidden md:block' : 'block'}
            `}>
              <Sidebar />
            </div>

            {/* Chat Container - full width on mobile */}
            <div className={`
              h-full flex-1
              ${selectedUser ? 'block' : 'hidden md:block'}
            `}>
              {selectedUser ? <ChatContainer /> : <NoChatSelected />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
