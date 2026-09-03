"use client";

import { useEffect, useRef, useState } from "react";

/** R9.1 — "Copy email" confirms with "Copied" for two seconds. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard denied: the mailto: link beside this button still works.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button type="button" className="btn" onClick={copy}>
        {copied ? "Copied" : label}
      </button>
      <span aria-live="polite" className="visually-hidden">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}
