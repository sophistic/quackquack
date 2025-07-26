import { useEffect, useRef, useState } from "react";
// Fix for Electron ipcRenderer import
let ipcRenderer: any = undefined;
if (typeof window !== "undefined" && (window as any).electron?.ipcRenderer) {
  ipcRenderer = (window as any).electron.ipcRenderer;
} else if (typeof window !== "undefined" && (window as any).ipcRenderer) {
  ipcRenderer = (window as any).ipcRenderer;
} else {
  try {
    // @ts-ignore
    ipcRenderer = require("electron").ipcRenderer;
  } catch (e) {
    ipcRenderer = undefined;
  }
}

import LoginScreen from "./routes/LoginScreen";
import OverlayBar from "./routes/OverlayBar";
import ChatComponent from "./routes/ChatComponent";
import { HeroUIProvider } from "@heroui/react";
import SettingsComponent from "./routes/SettingsComponent";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
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
      if (ipcRenderer) {
        ipcRenderer.send("resize-window", { width, height });
      }
    };

    resizeWindow();
    const observer = new ResizeObserver(resizeWindow);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [loggedIn, showChat]); // ✅ Recalculate when content changes

  return (
    
      <div
      ref={containerRef}
      className=" bg-black rounded-lg overflow-hidden  drag transition-all  select-none dark text-foreground"
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
