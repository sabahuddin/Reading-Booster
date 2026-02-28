import { useState, useEffect, useCallback } from "react";

const FONT_SIZE_KEY = "citanje-font-size";
const MIN_SIZE = 14;
const MAX_SIZE = 22;
const DEFAULT_SIZE = 16;
const STEP = 2;

export function useFontSize() {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    return saved ? Number(saved) : DEFAULT_SIZE;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  }, [fontSize]);

  const increase = useCallback(() => {
    setFontSize((prev) => Math.min(prev + STEP, MAX_SIZE));
  }, []);

  const decrease = useCallback(() => {
    setFontSize((prev) => Math.max(prev - STEP, MIN_SIZE));
  }, []);

  const reset = useCallback(() => {
    setFontSize(DEFAULT_SIZE);
  }, []);

  return {
    fontSize,
    increase,
    decrease,
    reset,
    canIncrease: fontSize < MAX_SIZE,
    canDecrease: fontSize > MIN_SIZE,
    isDefault: fontSize === DEFAULT_SIZE,
  };
}
