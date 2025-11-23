"use client";

import { CDPReactProvider } from "@coinbase/cdp-react";

export default function CDPProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CDPReactProvider
      config={{
        projectId: "02c269a5-f42c-4dae-853a-2f4bab56d1bd",
        ethereum: {
          createOnLogin: "smart"
        }
      }}
    >
      {children}
    </CDPReactProvider>
  );
}





