"use client";

import { SessionProvider } from "./session-provider";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e1e24",
            border: "1px solid #2a2a30",
            color: "#f7f6f8",
          },
        }}
      />
    </SessionProvider>
  );
}
