import { useEffect, useRef, useState } from "react";
const { ipcRenderer } = window.require("electron");

import LoginScreen from "./routes/LoginScreen";
import OverlayBar from "./routes/OverlayBar";
import ChatComponent from "./routes/ChatComponent";
import SettingsComponent from "./routes/SettingsComponent";
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
      className="bg-black  drag      transition-all select-none"
    >
      {!loggedIn ? (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      ) : showChat ? (
        <ChatComponent onBack={() => setShowChat(false)} />
      ) : showSettings ? (
        <SettingsComponent onBack={() => setShowSettings(false)} />
      ) : (
        <OverlayBar
          onChatClick={() => setShowChat(true)}
          onSettingsClick={() => setShowSettings(true)}
        />
      )}
    </div>
  );
}

export default App;
