import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "@/app/signup/page";
import '@testing-library/jest-dom';

// Mock useRouter from next/navigation
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("SignupPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    pushMock.mockClear();
  });

  it("renders signup form", () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Sign Up/i })[0]).toBeInTheDocument();
  });

  it("shows error on failed signup", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      json: async () => ({ error: "Email already exists" }),
    });

    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Sign Up/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });

  it("shows success and redirects on successful signup", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => ({}),
    });

    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Sign Up/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(/Account created successfully/i)).toBeInTheDocument();
    });

    // Wait for redirect (simulate setTimeout)
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    }, { timeout: 2000 });
  });
});