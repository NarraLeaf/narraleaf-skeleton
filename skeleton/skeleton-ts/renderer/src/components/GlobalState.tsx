import { createContext, useContext, useState } from "react";

interface GlobalStateConfig {
    isSplashScreen: boolean;
}

interface GlobalStateConfigContextType {
    globalStateConfig: GlobalStateConfig;
    setGlobalStateConfig: (globalStateConfig: GlobalStateConfig | ((prev: GlobalStateConfig) => GlobalStateConfig)) => void;
}

type UseGlobalStateConfigReturn<K extends keyof GlobalStateConfig> = [
    GlobalStateConfig[K],
    (value: GlobalStateConfig[K] | ((prev: GlobalStateConfig[K]) => GlobalStateConfig[K])) => void
];

export const GlobalStateConfigContext = createContext<GlobalStateConfigContextType | null>(null);
const defaultGlobalStateConfig: GlobalStateConfig = {
    isSplashScreen: true,
};

export function GlobalStateConfigProvider({ children }: { children: React.ReactNode }) {
    const [globalStateConfig, setGlobalStateConfig] = useState<GlobalStateConfig>(defaultGlobalStateConfig);

    return (
        <GlobalStateConfigContext value={{ globalStateConfig, setGlobalStateConfig }}>
            {children}
        </GlobalStateConfigContext>
    );
}

export function useGlobalStateConfig<K extends keyof GlobalStateConfig>(key: K): UseGlobalStateConfigReturn<K> {
    const context = useContext(GlobalStateConfigContext);
    if (!context) {
        throw new Error("useGlobalStateConfig must be used within a GlobalStateConfigProvider");
    }
    
    const setter = (value: GlobalStateConfig[K] | ((prev: GlobalStateConfig[K]) => GlobalStateConfig[K])) => {
        context.setGlobalStateConfig(prev => ({
            ...prev,
            [key]: typeof value === 'function' ? value(prev[key]) : value
        }));
    };
    
    return [context.globalStateConfig[key], setter];
}