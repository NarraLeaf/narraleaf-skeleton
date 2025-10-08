import React, { useCallback, createContext, useContext, useMemo } from "react";
import { useApp, useGamePlayback } from "narraleaf/renderer";
import { motion, usePresence } from "motion/react";
import { HomePanel, MenuButton } from "../../src/components/HomePanel";
import { usePathname, useRouter } from "narraleaf-react";
import { GameExitListener } from "../../src/components/GameExitListener";
import { useConfirm } from "../../src/hooks/useConfirm";

// Confirm Context Types
interface ConfirmConfig {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmContextType {
  showConfirm: (config: ConfirmConfig) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

// Hook to use confirm context
export const useAppConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useAppConfirm must be used within a ConfirmProvider');
  }
  return context;
};

// ConfirmProvider component
function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [confirmExit, ConfirmExitDialog] = useConfirm({
    message: "Are you sure you want to exit the game?",
  });
  const [confirmQuit, ConfirmQuitDialog] = useConfirm({
    message: "Are you sure you want to quit the game?",
  });
  const [confirmLoad, ConfirmLoadDialog] = useConfirm({
    message: "Are you sure you want to load this save?",
  });
  const [confirmSave, ConfirmSaveDialog] = useConfirm({
    message: "Are you sure you want to overwrite the current save?",
  });
  const [confirmGeneric, ConfirmGenericDialog] = useConfirm({
    message: "Are you sure you want to perform this action?",
  });

  const showConfirm = useCallback(async (config: ConfirmConfig): Promise<boolean> => {
    switch (config.message) {
      case "Are you sure you want to exit the game?":
        return await confirmExit();
      case "Are you sure you want to quit the game?":
        return await confirmQuit();
      case "Are you sure you want to load this save?":
        return await confirmLoad();
      case "Are you sure you want to overwrite the current save?":
        return await confirmSave();
      default:
        // For generic messages, update the confirm message and use generic dialog
        return await confirmGeneric();
    }
  }, [confirmExit, confirmQuit, confirmLoad, confirmSave, confirmGeneric]);

  const contextValue: ConfirmContextType = useMemo(() => ({
    showConfirm
  }), [showConfirm]);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      {ConfirmExitDialog}
      {ConfirmQuitDialog}
      {ConfirmLoadDialog}
      {ConfirmSaveDialog}
      {ConfirmGenericDialog}
    </ConfirmContext.Provider>
  );
}



function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentPathname = usePathname();
  const bgImage = "url('/static/img/ui/bg/outside.jpg')";
  const app = useApp();
  const { isPlaying } = useGamePlayback();
  const { showConfirm } = useAppConfirm();

  const isHomePage = currentPathname === "/home";

  // Use usePresence hook to control exit animation
  const [isPresent, safeToRemove] = usePresence();

  // Handle exit animation completion callback
  const handleExitComplete = useCallback(() => {
    // When exit animation is complete, call safeToRemove to notify that component can be safely removed
    if (!isPresent) {
      safeToRemove();
    }
  }, [isPresent, safeToRemove]);

  const onlyInHome = (v: MenuButton): MenuButton[] => {
    if (!isPlaying) {
      return [v];
    }
    return [];
  };

  const onlyInPlaying = (v: MenuButton): MenuButton[] => {
    if (isPlaying) {
      return [v];
    }
    return [];
  };

  // Define menu buttons with active states
  const menuButtons: MenuButton[] = [
    ...onlyInHome({
      id: "start-game",
      label: "Start Game",
      active: false,
      onClick: () => {
        app.newGame();
      }
    }),
    ...onlyInHome({
      id: "continue-game",
      label: "Continue Game",
      active: false,
      onClick: () => {
        app.continueGame();
      }
    }),
    ...onlyInPlaying({
      id: "continue-game",
      label: "Continue Game",
      onClick: () => {
        router.navigate("/");
      }
    }),
    {
      id: "load-game",
      label: "Load Game",
      active: router.getPathname() === "/home/load",
      onClick: () => {
        router.navigate("/home/load");
      }
    },
    ...onlyInPlaying({
      id: "save-game",
      label: "Save Game",
      active: router.getPathname() === "/home/save",
      onClick: () => {
        router.navigate("/home/save");
      }
    }),
    {
      id: "settings",
      label: "Game Settings",
      active: router.getPathname() === "/home/settings",
      onClick: () => {
        router.navigate("/home/settings");
      }
    },
    {
      id: "about",
      label: "About Game",
      active: router.getPathname() === "/home/about",
      onClick: () => {
        router.navigate("/home/about");
      }
    },
    ...onlyInPlaying({
      id: "exit-game",
      label: "Return to Main Menu",
      active: false,
      onClick: () => {
        handleExit();
      }
    }),
    {
      id: "exit-app",
      label: "Quit",
      active: false,
      onClick: async () => {
        const result = await showConfirm({ message: "Are you sure you want to quit the game?" });
        if (result) {
          app.quit();
        }
      }
    }
  ];

  const bgVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  async function handleExit() {
    const result = await showConfirm({ message: "Are you sure you want to exit the game?" });
    if (result) {
      app.exitGame();
    }
  }

  return (
    <motion.div
      className="w-full h-full absolute"
      style={{
        backgroundImage: isPlaying ? 'none' : bgImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      variants={bgVariants}
      initial="hidden"
      animate={isPresent ? "visible" : "exit"}
    >
      <GameExitListener />

      <HomePanel
        key="home-panel"
        buttons={menuButtons}
        raw={isHomePage}
        isHomePage={isHomePage}
        onExitComplete={handleExitComplete}
        presence={isPresent}
      >
        {isHomePage ? (
          <>
            <div className="min-h-[500px]">
              {/* Main Title */}
              <div className="absolute top-12 right-12 text-right">
                <h1 className="text-6xl font-bold text-white">
                  NarraLeaf Demo
                </h1>
                <div className="h-1 w-32 bg-white/90 ml-auto mt-4 rounded-full"></div>
              </div>

              {/* Copyright Information */}
              <div className="absolute bottom-8 right-12 text-right text-white">
                <img
                  src="/static/img/ui/logo-text-blue.png"
                  alt="Logo"
                  className="w-auto h-auto max-w-[180px] ml-auto"
                />
                <p className="text-sm font-medium">© 2025 NarraLeaf Project.</p>
                <p className="text-xs mt-2 text-gray-100 max-w-md ml-auto font-medium">
                  This is a demo project of the NarraLeaf engine, showcasing basic engine features only and does not represent the final product
                </p>
              </div>
            </div>
          </>
        ) : children}
      </HomePanel>
    </motion.div>
  );
}

// Main Layout component with ConfirmProvider
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <LayoutContent>{children}</LayoutContent>
    </ConfirmProvider>
  );
}

