import { useChatStore } from "../store/useChatStore";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-100">
      {selectedUser ? (
        <ChatContainer />
      ) : (
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-50">
            <Navbar />
          </div>
          <div className="flex-1 overflow-hidden">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
