import { useGame, useRouter } from "narraleaf-react";
import { useMemo, useRef } from "react";
import ScrollableContainer from "../../../src/components/lib/ScrollableContainer";

export default function History() {
  const router = useRouter();
  const game = useGame();
  const liveGame = game.getLiveGame();
  const hasDragged = useRef(false);

  const history = liveGame.getHistory();

  // Filter history to show only meaningful entries (text or menu selections)
  const filteredHistory = useMemo(() => 
    history.filter(h => h.element.text || (h.element.type === "menu" && h.element.selected)), 
    [history]
  );

  // Handle click to undo to specific history point
  function handleClick(token: string) {
    if (hasDragged.current) return;
    game.getLiveGame().undo(token);
    router.clear();
  }

  // Keyboard navigation for accessibility
  const handleKeyNavigation = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleClick(filteredHistory[index].token);
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      const prevElement = document.querySelector(`[data-index="${index - 1}"]`) as HTMLElement;
      prevElement?.focus();
      prevElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'ArrowDown' && index < filteredHistory.length - 1) {
      e.preventDefault();
      const nextElement = document.querySelector(`[data-index="${index + 1}"]`) as HTMLElement;
      nextElement?.focus();
      nextElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Track scroll state to prevent accidental clicks during drag
  const handleScroll = () => {
    hasDragged.current = true;
    setTimeout(() => { hasDragged.current = false; }, 100);
  };

  // Common styles for history items
  const historyItemClass = "p-4 border border-primary rounded-lg cursor-pointer hover:bg-primary/10 transition-colors duration-200 text-white focus:outline-2 focus:outline focus:outline-primary focus:outline-offset-[-2px] focus:shadow-[0_0_15px_rgba(var(--color-primary),0.5)] focus:border-primary/80 focus:bg-primary/20";

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">History</h1>
      </div>
      <ScrollableContainer className="flex-1 pr-4 min-h-[450px] max-h-[450px] max-h-[450px]" autoScrollToBottom={true} onScroll={handleScroll}>
        <div className="space-y-4">
          {filteredHistory.map((h, index) => {
            const isLast = index === filteredHistory.length - 1;
            const commonProps = {
              id: isLast ? "last-history" : undefined,
              key: h.token,
              "data-index": index,
              onClick: () => handleClick(h.token),
              onKeyDown: (e: React.KeyboardEvent) => handleKeyNavigation(e, index),
              tabIndex: 0,
              className: historyItemClass
            };

            // Render menu selection
            if (h.element.type === "menu") {
              return <div {...commonProps}>{h.element.text}{h.element.text && ": "}{h.element.selected}</div>;
            }

            // Render dialogue or narration
            return (
              <div {...commonProps}>
                {h.element.character ? (
                  <>
                    <span className="text-primary font-bold">{h.element.character}</span> {": "} 
                    <span className="text-white">{h.element.text}</span>
                  </>
                ) : (
                  <span className="text-neutral-300 italic">{h.element.text}</span>
                )}
              </div>
            );
          })}
        </div>
      </ScrollableContainer>
    </div>
  );
}

export const config = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.1,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
    }
  },
};
