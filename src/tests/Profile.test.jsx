import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Profile from "../pages/Profile";
import { Context } from "../main";

vi.mock("../components/Loader", () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

describe("Profile Component", () => {
  const renderProfile = (contextProps) => {
    return render(
      <BrowserRouter>
        <Context.Provider value={contextProps}>
          <Profile />
        </Context.Provider>
      </BrowserRouter>
    );
  };

  it("redirects to /register if not authenticated", () => {
    renderProfile({ isAuthenticated: false, loading: false, user: {} });
    expect(window.location.pathname).toBe("/login");
  });

  it("shows loader when loading", () => {
    renderProfile({ isAuthenticated: true, loading: true, user: {} });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders user data if authenticated and not loading", () => {
    renderProfile({
      isAuthenticated: true,
      loading: false,
      user: { name: "Test User", email: "test@example.com" },
    });

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
