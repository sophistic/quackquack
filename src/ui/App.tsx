import { useEffect, useRef, useState } from "react";
const { ipcRenderer } = window.require("electron");

import LoginScreen from "./components/LoginScreen";
import OverlayBar from "./components/OverlayBar";
import ChatComponent from "./components/ChatComponent";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeWindow = () => {
      const height = containerRef.current!.scrollHeight;
      const width = containerRef.current!.scrollWidth;
      ipcRenderer.send("resize-window", { width, height });
    };

    resizeWindow();
    const observer = new ResizeObserver(resizeWindow);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [loggedIn, showChat]); // ✅ Recalculate when content changes

  return (
    <div
      ref={containerRef}
      className="bg-black        transition-all select-none"
      style={{ WebkitAppRegion: "drag" }}
    >
      {!loggedIn ? (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      ) : showChat ? (
        <ChatComponent onBack={() => setShowChat(false)} />
      ) : (
        <OverlayBar onChatClick={() => setShowChat(true)} />
      )}
    </div>
  );
}

export default App;
