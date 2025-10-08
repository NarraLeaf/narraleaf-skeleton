import { LiveGameEventToken, NotificationToken, useGame, usePreference, useRouter } from 'narraleaf-react';
import { useConfirm } from '../hooks/useConfirm';
import { useApp, useSaveAction } from 'narraleaf/renderer';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Interface for menu item properties
interface MenuItemProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

// Individual menu item component with hover effects and active state
function MenuItem({ label, onClick, disabled, active }: MenuItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick();
    }
    // Remove focus after click to prevent keyboard navigation issues
    e.currentTarget.blur();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
                flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors whitespace-nowrap
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 active:bg-white/30'}
                ${active ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}
            `}
      tabIndex={-1}
    >
      <span className={`text-xs text-white ${active ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`}>{label}</span>
    </button>
  );
}

// Main quick menu component that provides game controls and shortcuts
export function QuickMenu() {
  // Game state and utilities
  const game = useGame();
  const liveGame = game.getLiveGame();
  const router = useRouter();
  const app = useApp();
  const { quickSave, quickRead } = useSaveAction();

  // User preferences
  const [autoForward] = usePreference("autoForward");
  const [showDialog, setShowDialog] = usePreference("showDialog");
  // Reference to track fast forward notification
  const fastForwardNotification = useRef<NotificationToken | null>(null);

  // Confirmation dialogs for destructive actions
  const [confirmExit, ConfirmExitDialog] = useConfirm({
    message: "Are you sure you want to exit the game?",
  });
  const [confirmQuickRead, ConfirmQuickReadDialog] = useConfirm({
    message: "Are you sure you want to read the quick save?",
  });

  // Handle keyboard shortcuts and global key events
  useEffect(() => {
    // Clean up any existing fast forward notification
    if (fastForwardNotification.current) {
      fastForwardNotification.current.cancel();
      fastForwardNotification.current = null;
    }
    let token: LiveGameEventToken | null = null;

    // Handle key down events for game shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Right arrow: Enable fast forward mode
      if (e.key === 'ArrowRight') {
        if (fastForwardNotification.current) {
          return;
        }
        fastForwardNotification.current = game.getLiveGame().notify("Fast forwarding...", null);
        game.preference.setPreference("gameSpeed", 10);
        game.preference.setPreference("autoForward", true);
      }
      // Escape: Navigate to settings
      else if (e.key === 'Escape' && router.getPathname() !== "settings") {
        router.navigate("/home/settings");
      }
      // Up arrow: Navigate to history and focus last entry
      else if (e.key === 'ArrowUp' && router.getPathname() !== "history") {
        router.navigate("/history");

        // Cancel previous token if exists
        if (token) {
          token.cancel();
        }

        // Wait for page mount and focus on last history entry
        const routerToken = liveGame.waitForPageMount();
        routerToken.promise.then(() => {
          setTimeout(() => {
            const element = document.getElementById("last-history");
            if (element) {
              element.focus();
              console.log("last-history element found and focused", element);
            } else {
              console.warn("last-history element not found");
            }
          }, 100);
        });
        token = routerToken;
      }
    };

    // Handle key up events to disable fast forward
    const handleKeyUp = (e: KeyboardEvent) => {
      // Right arrow: Disable fast forward mode
      if (e.key === 'ArrowRight') {
        if (fastForwardNotification.current) {
          fastForwardNotification.current.cancel();
          fastForwardNotification.current = null;
        }
        game.preference.setPreference("gameSpeed", 1);
        game.preference.setPreference("autoForward", false);
      }
    };

    // Register global event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function to remove event listeners and cancel tokens
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (token) {
        token.cancel();
      }
    };
  }, [router]);

  // Handle right-click context menu to toggle quick menu visibility
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowDialog(!showDialog);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [showDialog, setShowDialog]);

  // Game action handlers
  function handleUndo() {
    liveGame.undo();
  }

  function handleHistory() {
    console.log("push history");
    router.navigate("/home/history");
  }

  function handleAutoForward() {
    game.preference.togglePreference("autoForward");
  }

  function handleExit() {
    confirmExit().then((result: boolean) => {
      if (result) {
        app.exitGame();
      }
    });
  }

  function handleLoad() {
    router.navigate("/home/load");
  }

  function handleSave() {
    router.navigate("/home/save");
  }

  function handleSettings() {
    router.navigate("/home/settings");
  }

  function handleQuickSave() {
    quickSave();
    game.getLiveGame().notify("Quick save successful");
  }

  function handleSkipDialog() {
    liveGame.skipDialog();
  }

  // Handle quick read with confirmation dialog
  async function handleQuickRead() {
    const result = await confirmQuickRead();
    if (result) {
      const savedGame = await quickRead();
      if (!savedGame) {
        game.getLiveGame().notify("Quick read failed");
        return;
      }

      game.getLiveGame().deserialize(savedGame);
      game.getLiveGame().notify("Quick read successful");
    }
  }

  return (
    <>
      {/* Animated quick menu with spring transitions */}
      <AnimatePresence>
        {showDialog && (
          <div className="fixed bottom-5 left-0 right-0 flex justify-center">
            <motion.div
              className={clsx("flex items-center gap-2 px-4 py-1 rounded-full")}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.3
              }}
            >
              {/* Menu items for game controls */}
              <MenuItem label="Undo" onClick={handleUndo} />
              <MenuItem label="History" onClick={handleHistory} />
              <MenuItem label="Skip" onClick={handleSkipDialog} />
              <MenuItem label="Auto" onClick={handleAutoForward} active={autoForward} />
              <MenuItem label="Save" onClick={handleSave} />
              <MenuItem label="Q.Save" onClick={handleQuickSave} />
              <MenuItem label="Load" onClick={handleLoad} />
              <MenuItem label="Q.Read" onClick={handleQuickRead} />
              <MenuItem label="Settings" onClick={handleSettings} />
              <MenuItem label="Home" onClick={handleExit} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Confirmation dialogs */}
      {ConfirmExitDialog}
      {ConfirmQuickReadDialog}
    </>
  );
}