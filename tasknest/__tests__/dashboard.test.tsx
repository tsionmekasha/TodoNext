// __tests__/DashboardPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import '@testing-library/jest-dom';
import React from "react";

// Global pushMock for useRouter
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock fetch and localStorage
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { _id: "1", title: "Test Todo", completed: false },
      ]),
    })
  ) as jest.Mock;

  // mock localStorage
  Storage.prototype.getItem = jest.fn(() => "dummyToken");
  pushMock.mockClear();
});

describe("DashboardPage", () => {
  it("renders the dashboard with todos", async () => {
    render(<DashboardPage />);

    expect(screen.getByText(/Welcome Back!/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Test Todo")).toBeInTheDocument();
    });
  });

it("redirects if token is missing", async () => {
  Storage.prototype.getItem = jest.fn(() => null);
  render(<DashboardPage />);
  await waitFor(() => {
    expect(pushMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
});
