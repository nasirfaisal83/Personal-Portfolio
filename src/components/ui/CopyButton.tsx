"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

/**
 * R9.1 — "Copy email" confirms with "Copied" for two seconds.
 *
 * The button reads "Copy", then "Copied". Its accessible name is `label` until
 * the copy succeeds and "Copied" for those two seconds; the live region beside
 * it announces the change.
 */
export function CopyButton({
  value,
  label,
  className = "pill pill--outline",
}: {
  value: string;
  label: string;
  className?: string;
}) {
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
      <button
        type="button"
        className={className}
        onClick={copy}
        aria-label={copied ? "Copied" : label}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied" : "Copy"}
      </button>
      <span aria-live="polite" className="visually-hidden">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}
