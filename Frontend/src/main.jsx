import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AnimatedBackground from "./components/AnimatedBackground";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <>
        <AnimatedBackground />
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 2500,
            style: {
              background: "rgba(20, 20, 32, 0.85)",
              color: "#eef0f7",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              fontSize: "14px",
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: "#34d399", secondary: "#0b0b14" },
            },
            error: {
              iconTheme: { primary: "#fb7185", secondary: "#0b0b14" },
            },
          }}
        />
      </>
    </AuthProvider>
  </BrowserRouter>,
);
