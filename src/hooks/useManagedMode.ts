import { useState, useCallback } from 'react';

export type Speaker = "A" | "B";

interface ManagedModeState {
  isEnabled: boolean;
  currentTurn: Speaker;
  setEnabled: (enabled: boolean) => void;
  setCurrentTurn: (speaker: Speaker) => void;
  switchTurn: () => void;
  canSpeak: (speaker: Speaker) => boolean;
}

export const useManagedMode = (initialEnabled: boolean = false): ManagedModeState => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [currentTurn, setCurrentTurn] = useState<Speaker>("A");

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    // Reset to Speaker A when enabling managed mode
    if (enabled) {
      setCurrentTurn("A");
    }
  }, []);

  const switchTurn = useCallback(() => {
    setCurrentTurn(prev => prev === "A" ? "B" : "A");
  }, []);

  const canSpeak = useCallback((speaker: Speaker) => {
    // In standard mode, both speakers can always speak
    if (!isEnabled) return true;
    // In managed mode, only the current turn speaker can speak
    return currentTurn === speaker;
  }, [isEnabled, currentTurn]);

  return {
    isEnabled,
    currentTurn,
    setEnabled,
    setCurrentTurn,
    switchTurn,
    canSpeak
  };
};