"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("businessos-theme", next); } catch { /* Theme still applies for this session. */ }
    setTheme(next);
  }

  return <button type="button" className="ds-icon-button" title={theme === "dark" ? "Use light appearance" : "Use dark appearance"} aria-label={theme === "dark" ? "Use light appearance" : "Use dark appearance"} aria-pressed={theme === "dark"} onClick={toggle}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
