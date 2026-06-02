import type { ReactNode } from "react";

/**
 * Mobile-first wrapper. On small screens it fills the viewport.
 * On large screens it shows the app inside a centered phone-shaped frame
 * so the design stays mobile-first even on desktop.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-stretch justify-center sm:items-center sm:py-8">
      <div className="relative w-full sm:max-w-[420px] sm:rounded-[44px] sm:border sm:border-border sm:shadow-2xl sm:overflow-hidden bg-background min-h-screen sm:min-h-[860px] sm:h-[860px]">
        {children}
      </div>
    </div>
  );
}
