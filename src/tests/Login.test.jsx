import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../pages/Login";
import { Context } from "../main";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

vi.mock("axios");

vi.mock("react-hot-toast", () => {
  return {
    __esModule: true,
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

import toast from "react-hot-toast";

describe("Login Component", () => {
  let setIsAuthenticated;
  let setLoading;

  beforeEach(() => {
    setIsAuthenticated = vi.fn();
    setLoading = vi.fn();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  const renderLogin = (contextProps = {}) => {
    return render(
      <BrowserRouter>
        <Context.Provider
          value={{
            isAuthenticated: false,
            setIsAuthenticated,
            loading: false,
            setLoading,
            user: {},
            setUser: vi.fn(),
            ...contextProps,
          }}
        >
          <Login />
        </Context.Provider>
      </BrowserRouter>
    );
  };

  it("renders the form fields", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("shows error toast if form is incomplete", async () => {
    renderLogin();

    const loginButton = screen.getByText("Login");

    fireEvent.submit(loginButton.closest("form"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fill Full Details");
    });
  });

  it("handles login success", async () => {
    axios.post.mockResolvedValue({ data: { message: "Login Successful" } });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(setLoading).toHaveBeenCalledWith(false);
      expect(toast.success).toHaveBeenCalledWith("Login Successful");
    });
  });

  it("handles login failure", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Invalid Credentials" } },
    });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(setIsAuthenticated).toHaveBeenCalledWith(false);
      expect(setLoading).toHaveBeenCalledWith(false);
      expect(toast.error).toHaveBeenCalledWith("Invalid Credentials");
    });
  });
});
