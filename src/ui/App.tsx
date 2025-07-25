import { useEffect, useRef, useState } from "react";
const { ipcRenderer } = window.require("electron");

import LoginScreen from "./components/LoginScreen";
import OverlayBar from "./components/OverlayBar";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeWindow = () => {
      const height = containerRef.current!.scrollHeight;
      const width = containerRef.current!.scrollWidth;
      ipcRenderer.send("resize-window", { width, height });
    };

    resizeWindow(); // Initial

    const observer = new ResizeObserver(resizeWindow);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-black backdrop-blur-md  flex flex-col justify-start items-center p-4  shadow-lg transition-all "
      style={{ WebkitAppRegion: "drag" }} // ✅ Entire container draggable
    >
      {!loggedIn ? (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      ) : (
        <OverlayBar />
      )}
    </div>
  );
}

export default App;
