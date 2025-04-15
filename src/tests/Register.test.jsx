/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "../pages/Register";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../main";

vi.mock("axios");
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const customRender = (ui, { providerProps }) => {
  return render(
    <BrowserRouter>
      <Context.Provider value={providerProps}>{ui}</Context.Provider>
    </BrowserRouter>
  );
};

describe("Register Component", () => {
  let providerProps;

  beforeEach(() => {
    providerProps = {
      isAuthenticated: false,
      setIsAuthenticated: vi.fn(),
      loading: false,
      setLoading: vi.fn(),
      user: {},
      setUser: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("renders all form fields and submit button", () => {
    customRender(<Register />, { providerProps });
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("shows error if form fields are empty", async () => {
    customRender(<Register />, { providerProps });

    const form =
      screen.getByRole("form", { hidden: true }) ||
      screen.getByRole("button", { name: /sign up/i }).closest("form");

    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fill Full Form");
    });
  });

  it("submits form and shows success toast", async () => {
    axios.post.mockResolvedValue({
      data: { message: "Registered successfully" },
    });

    customRender(<Register />, { providerProps });

    await userEvent.type(screen.getByPlaceholderText(/name/i), "John");
    await userEvent.type(
      screen.getByPlaceholderText(/email/i),
      "john@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText(/password/i), "password");

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(providerProps.setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(toast.success).toHaveBeenCalledWith("Registered successfully");
    });
  });

  it("shows error toast on registration failure", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Email already exists" } },
    });

    customRender(<Register />, { providerProps });

    await userEvent.type(screen.getByPlaceholderText(/name/i), "John");
    await userEvent.type(
      screen.getByPlaceholderText(/email/i),
      "john@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText(/password/i), "password");

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already exists");
      expect(providerProps.setIsAuthenticated).toHaveBeenCalledWith(false);
    });
  });

  it("redirects if already authenticated", () => {
    providerProps.isAuthenticated = true;
    customRender(<Register />, { providerProps });
    expect(screen.queryByPlaceholderText(/name/i)).not.toBeInTheDocument();
  });
});
