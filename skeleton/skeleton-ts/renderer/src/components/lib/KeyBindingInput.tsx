import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { KeyBindingValue } from "narraleaf-react";

interface KeyBindingInputProps {
  /** Current key binding value */
  value: KeyBindingValue;
  /** Callback when user selects a new key */
  onChange: (value: KeyBindingValue) => void;
  /** Optional button class */
  className?: string;
}

export const KeyBindingInput: React.FC<KeyBindingInputProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  // open modal
  const handleOpen = () => setIsOpen(true);

  // close modal
  const handleClose = () => setIsOpen(false);

  // When modal is open, listen for keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Escape") {
      handleClose();
      return;
    }

    // Update binding and close
    onChange(event.key);
    handleClose();
  }, [onChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isOpen, handleKeyDown]);

  // Display value as string
  const displayValue = Array.isArray(value)
    ? Array.from(new Set(value)).join(" / ")
    : value ?? "Unbound";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={clsx("px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors", className)}
      >
        {displayValue}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={clsx("fixed inset-0 bg-black/40")}
              onClick={handleClose}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative p-12 w-[400px] ZhanKu"
              style={{
                backgroundImage: "url('/static/img/ui/popup/popup-dialog.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              <h3 className="text-2xl text-white mb-6 text-center">Press the key to bind</h3>
              <p className="text-xl text-white text-center">Press Esc to cancel</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}; 