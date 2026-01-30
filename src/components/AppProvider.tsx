"use client";

import ModalProvider from "./providers/modal-provider";
import QueryProvider from "./providers/query-provider";
import ThemeProvider from "./ThemeProvider";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ModalProvider />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
