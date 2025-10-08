import { usePreference, useRouter, useGame, useKeyBinding, KeyBindingType, KeyBindingValue } from "narraleaf-react";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Checkbox } from "../../../src/components/lib/Checkbox";
import { Slider } from "../../../src/components/lib/Slider";
import { KeyBindingInput } from "../../../src/components/lib/KeyBindingInput";
import { HomePagesAnimation } from "../index";

interface SettingItemProps {
  label: string;
  children: React.ReactNode;
}

type WindowState = {
  mode: "fullscreen" | "windowed";
};

export type GamePreferences = {
  windowMode: "fullscreen" | "windowed";
  playerPreferences: Record<string, any>;
};

type TabId = "audio" | "text" | "display";

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: "text", label: "Text" },
  { id: "display", label: "Display" },
  { id: "audio", label: "Audio" },
];

const SettingItem: React.FC<SettingItemProps> = ({ label, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/20 last:border-b-0">
    <span className="text-white text-lg font-medium">{label}</span>
    {children}
  </div>
);

// Audio settings content
const AudioSettings: React.FC<{
  globalVolume: number;
  setGlobalVolume: (value: number) => void;
  soundVolume: number;
  setSoundVolume: (value: number) => void;
  voiceVolume: number;
  setVoiceVolume: (value: number) => void;
  bgmVolume: number;
  setBgmVolume: (value: number) => void;
}> = ({ globalVolume, setGlobalVolume, soundVolume, setSoundVolume, voiceVolume, setVoiceVolume, bgmVolume, setBgmVolume }) => {
  const volumeSettings = [
    { label: "Global Volume", value: globalVolume || 0.5, setter: setGlobalVolume },
    { label: "Sound Volume", value: soundVolume || 0.5, setter: setSoundVolume },
    { label: "Voice Volume", value: voiceVolume || 0.5, setter: setVoiceVolume },
    { label: "BGM Volume", value: bgmVolume || 0.5, setter: setBgmVolume }
  ];

  return (
    <div className="space-y-4" style={{ minHeight: '200px' }}>
      {volumeSettings.map(({ label, value, setter }) => (
        <SettingItem key={label} label={label}>
          <Slider
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
            min={0}
            max={1}
            step={0.01}
            isPercentage={true}
          />
        </SettingItem>
      ))}
    </div>
  );
};

// Text settings content
const TextSettings: React.FC<{
  cps: number;
  setCps: (value: number) => void;
  skipDelay: number;
  setSkipDelay: (value: number) => void;
  skipInterval: number;
  setSkipInterval: (value: number) => void;
}> = ({ cps, setCps, skipDelay, setSkipDelay, skipInterval, setSkipInterval }) => {
  const textSettings = [
    { label: "Text Speed", value: cps || 30, setter: setCps, min: 1, max: 100, unit: "cps" },
    { label: "Skip Delay", value: skipDelay || 100, setter: setSkipDelay, min: 0, max: 1000, step: 10, unit: "ms" },
    { label: "Skip Interval", value: skipInterval || 200, setter: setSkipInterval, min: 0, max: 1000, step: 10, unit: "ms" }
  ];

  return (
    <div className="space-y-4" style={{ minHeight: '200px' }}>
      {textSettings.map(({ label, value, setter, min, max, step, unit }) => (
        <SettingItem key={label} label={label}>
          <Slider
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            unit={unit}
          />
        </SettingItem>
      ))}
    </div>
  );
};

// Display settings content - extracted to component outside
const DisplaySettings: React.FC<{
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  skipKeyBinding: KeyBindingValue;
  setSkipKeyBinding: (value: KeyBindingValue) => void;
}> = ({ fullscreen, setFullscreen, skipKeyBinding, setSkipKeyBinding }) => (
  <div className="space-y-4" style={{ minHeight: '200px' }}>
    <SettingItem label="Fullscreen">
      <Checkbox
        checked={fullscreen}
        onChange={(e) => {
          window.NarraLeaf.app.requestMain<WindowState, void>("setWindowState", {
            mode: e.target.checked ? "fullscreen" : "windowed",
          });
          setFullscreen(e.target.checked);
        }}
      />
    </SettingItem>

    <SettingItem label="Skip Key">
      <KeyBindingInput
        value={skipKeyBinding}
        onChange={setSkipKeyBinding}
      />
    </SettingItem>
  </div>
);

export default function Settings() {
  const router = useRouter();
  const game = useGame();

  // Audio settings
  const [globalVolume, setGlobalVolume] = usePreference("globalVolume");
  const [soundVolume, setSoundVolume] = usePreference("soundVolume");
  const [voiceVolume, setVoiceVolume] = usePreference("voiceVolume");
  const [bgmVolume, setBgmVolume] = usePreference("bgmVolume");

  // Text settings
  const [cps, setCps] = usePreference("cps");
  const [skipDelay, setSkipDelay] = usePreference("skipDelay");
  const [skipInterval, setSkipInterval] = usePreference("skipInterval");

  // Display settings
  const [fullscreen, setFullscreen] = useState(false);
  const [skipKeyBinding, setSkipKeyBinding] = useKeyBinding(KeyBindingType.skipAction);

  // Tab state - use the first tab in the array as default value
  const [activeTab, setActiveTab] = useState<TabId>(tabs[0].id);
  const [previousTab, setPreviousTab] = useState<TabId>(tabs[0].id);
  // Use ref to immediately store animation direction, avoiding state update timing issues
  const animationDirectionRef = useRef<"left" | "right">("right");


  useEffect(() => {
    window.NarraLeaf.app.requestMain<void, WindowState>("getWindowState").then((response) => {
      if (response.success) {
        setFullscreen(response.data.mode === "fullscreen");
      }
    });
  }, []);

  // Persist preferences whenever related values change.
  // This effect runs *after* React has committed the state update, ensuring we write the latest values.
  useEffect(() => {
    const preferences: GamePreferences = {
      windowMode: fullscreen ? "fullscreen" : "windowed",
      playerPreferences: {
        cps,
        skipDelay,
        skipInterval,
        globalVolume,
        soundVolume,
        voiceVolume,
        bgmVolume,
      },
    };

    // Debounce writes to avoid persisting on every small change.
    const debounceTimer = setTimeout(() => {
      window.NarraLeaf.app.requestMain<GamePreferences, void>("setGamePreferences", preferences);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [
    fullscreen,
    globalVolume,
    soundVolume,
    voiceVolume,
    bgmVolume,
    cps,
    skipDelay,
    skipInterval,
  ]);


  // Function to calculate animation direction
  const getAnimationDirection = (fromTabId: TabId, toTabId: TabId): "right" | "left" => {
    const fromIndex = tabs.findIndex(tab => tab.id === fromTabId);
    const toIndex = tabs.findIndex(tab => tab.id === toTabId);
    return toIndex > fromIndex ? "right" : "left";
  };

  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      const direction = getAnimationDirection(activeTab, tabId);
      animationDirectionRef.current = direction;
      setPreviousTab(activeTab);
      setActiveTab(tabId);
    }
  };


  // Tab button animation variants
  const tabButtonVariants = {
    hover: { y: -4 },
    tap: { scale: 0.95 }
  };

  // Calculate current animation config
  const getCurrentAnimationConfig = () => {
    const direction = animationDirectionRef.current;
    return direction === "right"
      ? { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } }
      : { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 30 } };
  };

  const renderTabContent = () => {
    const components = {
      audio: <AudioSettings globalVolume={globalVolume} setGlobalVolume={setGlobalVolume} soundVolume={soundVolume} setSoundVolume={setSoundVolume} voiceVolume={voiceVolume} setVoiceVolume={setVoiceVolume} bgmVolume={bgmVolume} setBgmVolume={setBgmVolume} />,
      text: <TextSettings cps={cps} setCps={setCps} skipDelay={skipDelay} setSkipDelay={setSkipDelay} skipInterval={skipInterval} setSkipInterval={setSkipInterval} />,
      display: <DisplaySettings fullscreen={fullscreen} setFullscreen={setFullscreen} skipKeyBinding={skipKeyBinding} setSkipKeyBinding={setSkipKeyBinding} />
    };
    return components[activeTab] || <div className="text-white p-4">Unknown tab: {activeTab}</div>;
  };

  return (
    <motion.div
      key="settings-page"
      className=""
      {...HomePagesAnimation}
    >
      <div className="flex flex-col h-full">
        {/* Title bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        {/* Tab navigation */}
        <div className="flex mb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onMouseDown={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 px-6 transition-colors duration-200 outline-none ${activeTab === tab.id
                ? "text-white"
                : "text-white/70 hover:text-white"
                }`}
              variants={tabButtonVariants}
              whileHover="hover"
              whileTap="tap"
              animate="initial"
            >
              <span className={`text-xl relative z-10 ${activeTab === tab.id ? "font-bold" : "font-semibold"}`}>
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Tab content area */}
        <div className="flex-1 relative w-full h-full min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              {...getCurrentAnimationConfig()}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full h-full absolute inset-0"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}   