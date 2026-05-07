import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'var(--font)',
          fontSize: 'var(--text-sm)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--text-primary)',
          background: 'var(--surface-base)',
          padding: '12px 16px',
          maxWidth: '360px',
        },
        success: { iconTheme: { primary: 'var(--hot-dot)', secondary: 'white' } },
        error:   { iconTheme: { primary: '#dc2626',        secondary: 'white' } },
      }}
    />
  </>
);
