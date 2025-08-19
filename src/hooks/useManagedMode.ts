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
    setIsEnabled(prevEnabled => {
      // Only reset to Speaker A when transitioning FROM disabled TO enabled
      // Don't reset if already enabled (prevents admin settings from overriding user choices)
      if (enabled && !prevEnabled) {
        console.log('useManagedMode: Enabling managed mode and resetting to Speaker A');
        setCurrentTurn("A");
      } else if (enabled && prevEnabled) {
        console.log('useManagedMode: Managed mode already enabled, preserving current turn');
      }
      return enabled;
    });
  }, []);

  const switchTurn = useCallback(() => {
    setCurrentTurn(prevTurn => {
      console.log('useManagedMode: switchTurn called, current turn:', prevTurn);
      const newTurn = prevTurn === "A" ? "B" : "A";
      console.log('useManagedMode: turn switched to:', newTurn);
      return newTurn;
    });
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