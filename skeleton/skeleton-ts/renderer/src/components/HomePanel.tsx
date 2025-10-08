import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Button interface with active property
export interface MenuButton {
  id: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}

// Abstracted button component
interface MenuButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

function MenuButtonComponent({
  children,
  active = false,
  onClick
}: MenuButtonProps) {

  const textButtonVariants = {
    initial: { x: 0 },
    hover: { x: 10 },
    tap: { scale: 0.95 },
    selected: { x: 10 }
  };

  return (
    <motion.button
      onClick={onClick}
      className={`text-3xl font-medium cursor-pointer text-center transition-colors duration-200 hover:text-white relative drop-shadow-[0_1px_2px_rgba(255,255,255,0.2)] font-['ZhanKu',sans-serif] ${active ? 'text-white' : 'text-white/90'}`}
      variants={textButtonVariants}
      whileHover="hover"
      whileTap="tap"
      animate={active ? "selected" : "initial"}
    >
      {/* Selected state indicator */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-full -ml-2"
        initial={{ height: 0, opacity: 0 }}
        animate={active ? { height: 24, opacity: 1 } : { height: 0, opacity: 0 }}
      />

      <span>{children}</span>
    </motion.button>
  );
}

export function HomePanel({
  children,
  buttons,
  raw = false,
  isHomePage = true,
  onExitComplete,
  presence = true
}: {
  children: React.ReactNode;
  buttons: MenuButton[];
  raw?: boolean;
  isHomePage?: boolean;
  onExitComplete?: () => void;
  presence?: boolean;
}) {
  // Background images
  const leftPanelBgImage = "url('/static/img/ui/main-menu/main_menu_left.png')";
  const rightPanelBgImage = "url('/static/img/ui/main-menu/main_menu_right.png')";
  const leftPanelSecondaryBgImage = "url('/static/img/ui/main-menu/main_menu_left_layer.png')";
  const rightPanelSecondaryBgImage = "url('/static/img/ui/main-menu/main_menu_right_layer.png')";

  // Panel widths
  const leftPanelWidth = (374 / 1270) * 100;
  const rightPanelWidth = (896 / 1270) * 100;

  // Animation variants
  const leftPanelVariants = { hidden: { x: '-100%' }, visible: { x: 0 }, exit: { x: '-100%' } };
  const rightPanelVariants = { hidden: { x: '100%' }, visible: { x: 0 }, exit: { x: '100%' } };
  return (
    <div
      className={`flex h-full w-full relative overflow-hidden ${!isHomePage ? 'bg-black/50' : ''}`}
    >
      <div className="relative h-full" style={{ width: `${leftPanelWidth}%` }}>
        <AnimatePresence>
          {presence && (
            <motion.div
              className={`absolute inset-0 z-0 pointer-events-none bg-contain bg-center bg-no-repeat opacity-70`}
              style={{ backgroundImage: leftPanelSecondaryBgImage }}
              variants={leftPanelVariants}
              initial={isHomePage ? "hidden" : "visible"}
              exit="exit"
              animate="visible"
            />
          )}
        </AnimatePresence>

        <AnimatePresence onExitComplete={onExitComplete}>
          {presence && (
            <motion.div
              className="absolute inset-0 flex flex-col justify-center items-center relative pointer-events-none bg-contain bg-center bg-no-repeat h-full"
              style={{ backgroundImage: leftPanelBgImage }}
              variants={leftPanelVariants}
              initial={isHomePage ? "hidden" : "visible"}
              exit="exit"
              animate="visible"
            >
              <div className="w-full max-w-xs flex flex-col space-y-6 relative z-20 items-center p-6 ml-2.5">
                {buttons.map((button) => (
                  <MenuButtonComponent
                    key={button.id}
                    active={button.active}
                    onClick={button.onClick}
                  >
                    {button.label}
                  </MenuButtonComponent>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative h-full" style={{ width: `${rightPanelWidth}%` }}>
        {!raw && (
          <AnimatePresence>
            {presence && (
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none bg-contain bg-center bg-no-repeat opacity-70"
                style={{ backgroundImage: rightPanelSecondaryBgImage }}
                variants={rightPanelVariants}
                initial={isHomePage ? "hidden" : "visible"}
                exit="exit"
                animate="visible"
              />
            )}
          </AnimatePresence>
        )}

        <AnimatePresence>
          {presence && (
            <motion.div
              className="relative flex items-center justify-center h-full bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: raw ? 'none' : rightPanelBgImage }}
              variants={rightPanelVariants}
              initial={isHomePage ? "hidden" : "visible"}
              exit="exit"
              animate="visible"
            >
              <div className="w-full h-full p-[7rem] pl-[6rem] pr-[10rem] relative z-20">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
