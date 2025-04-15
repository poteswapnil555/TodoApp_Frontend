import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../pages/Home";
import { Context } from "../main";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

vi.mock("axios");

vi.mock("react-hot-toast", () => {
  const toast = vi.fn();
  toast.success = vi.fn();
  toast.error = vi.fn();
  return {
    __esModule: true,
    default: toast,
  };
});

vi.mock("../components/TodoItem", () => ({
  __esModule: true,
  default: ({ title }) => <div>{title}</div>,
}));

import toast from "react-hot-toast";

describe("Home Component", () => {
  const renderHome = (contextProps = {}) => {
    return render(
      <BrowserRouter>
        <Context.Provider
          value={{
            isAuthenticated: true,
            ...contextProps,
          }}
        >
          <Home />
        </Context.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: { tasks: [] } });
  });

  it("redirects to login if not authenticated", async () => {
    renderHome({ isAuthenticated: false });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
  });

  it("renders form inputs and Add Task button", async () => {
    renderHome();
    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  it("adds task and resets input fields", async () => {
    axios.post.mockResolvedValue({ data: { message: "Task added" } });

    renderHome();

    const titleInput = screen.getByPlaceholderText("Title");
    const descInput = screen.getByPlaceholderText("Description");

    await userEvent.clear(titleInput);
    await userEvent.clear(descInput);
    await userEvent.type(titleInput, "New Task");
    await userEvent.type(descInput, "Test Description");
    await userEvent.click(screen.getByText("Add Task"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Task added");
    });
  });

  it("loads and displays tasks", async () => {
    axios.get.mockResolvedValue({
      data: {
        tasks: [
          {
            _id: "1",
            title: "Task One",
            description: "Desc One",
            isCompleted: false,
          },
        ],
      },
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("Task One")).toBeInTheDocument();
    });
  });
});
