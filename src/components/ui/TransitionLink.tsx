"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * R5.3 — navigating between a project section and its case-study page runs
 * inside a view transition, so the screen (which carries the same
 * `view-transition-name` on both sides) morphs rather than cutting. Browsers
 * without the API navigate normally, and reduced motion collapses the
 * transition to a 150ms crossfade in CSS.
 */
export function TransitionLink({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter();

  const startsTransition =
    typeof document !== "undefined" &&
    typeof (document as Document & { startViewTransition?: unknown }).startViewTransition ===
      "function";

  if (!startsTransition) return <Link href={href}>{children}</Link>;

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        const doc = document as Document & {
          startViewTransition: (cb: () => void) => { finished: Promise<void> };
        };
        doc.startViewTransition(() => {
          router.push(href);
        });
      }}
    >
      {children}
    </Link>
  );
}
