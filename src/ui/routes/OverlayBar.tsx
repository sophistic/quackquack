
import { MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface OverlayBarProps {
  onChatClick: () => void;
  onSettingsClick: () => void;
}
export default function OverlayBar({ onChatClick, onSettingsClick }: OverlayBarProps) {
  return (
    <div className="bg-card border-2 border-primary/20 rounded-md drag flex items-center justify-between gap-4 p-3 font-inter shadow-lg">
      {/* Left side title with fade animation */}
      <AnimatePresence>
        <motion.span
          className="text-xl font-light text-foreground tracking-tighter select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.785, 0.135, 0.15, 0.86], type: "tween" }}
        >
          Quackkk
        </motion.span>
      </AnimatePresence>
      <div className="flex gap-2">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.785, 0.135, 0.15, 0.86], type: "tween" }}
          >
            <Button
              variant="ghost"
              onClick={onChatClick}
              className="no-drag flex !bg-primary/10 items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MessageCircle size={18} />
              <span>Chat</span>
            </Button>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.785, 0.135, 0.15, 0.86], type: "tween" }}
          >
            <Button
              variant="ghost"
              onClick={onSettingsClick}
              className="no-drag flex !bg-primary/10 items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings size={18} />
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
