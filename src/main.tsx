import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles.css";

type ErrorBoundaryState = {
  error: Error | null;
};

class AppErrorBoundary extends React.Component<{ children?: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("App runtime error:", error);
  }

  render() {
    const isVietnamese = typeof navigator !== "undefined" && navigator.language.startsWith("vi");
    const title = isVietnamese ? "Ứng dụng gặp lỗi runtime" : "Application runtime error";
    const description = isVietnamese
      ? "Đã xảy ra lỗi chặn giao diện hiển thị. Chi tiết lỗi:"
      : "Something is preventing the app from rendering. Error details:";

    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "24px",
            fontFamily: '"Be Vietnam Pro", "Segoe UI", sans-serif',
            background: "#F7F3EE",
            color: "#2B211B",
          }}
        >
          <h1 style={{ margin: "0 0 12px", fontSize: "24px" }}>{title}</h1>
          <p style={{ margin: "0 0 12px", color: "#6E5A4A" }}>{description}</p>
          <pre
            style={{
              padding: "16px",
              background: "#FFFFFF",
              border: "1px solid #E7DED2",
              borderRadius: "12px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

const logoIconUrl = new URL("./img/logo.png", import.meta.url).href;

const existingIcons = Array.from(
  document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"], link[rel="apple-touch-icon"]'),
);

existingIcons.forEach((icon) => icon.remove());

const icon = document.createElement("link");
icon.rel = "icon";
icon.type = "image/png";
icon.sizes = "32x32";
icon.href = logoIconUrl;
document.head.appendChild(icon);

const appleIcon = document.createElement("link");
appleIcon.rel = "apple-touch-icon";
appleIcon.sizes = "180x180";
appleIcon.href = logoIconUrl;
document.head.appendChild(appleIcon);

document.title = "BA.SEW Tracking";
document.body.dataset.appMounted = "true";

createRoot(rootElement).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
