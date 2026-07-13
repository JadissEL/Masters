"use client";

import ThemeProvider from "./ThemeProvider";
import AppShell from "./AppShell";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}
