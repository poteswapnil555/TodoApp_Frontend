import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/App.css";
import App from "./App.jsx";
import { createContext } from "react";

export const Server = "https://todoapp-backend-avvj.onrender.com/api/v1";

export const Context = createContext({ isAuthenticated: false });

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        loading,
        setLoading,
        user,
        setUser,
      }}
    >
      <App />
    </Context.Provider>
  );
};

if (typeof document !== "undefined") {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <AppWrapper />
      </StrictMode>
    );
  }
}
