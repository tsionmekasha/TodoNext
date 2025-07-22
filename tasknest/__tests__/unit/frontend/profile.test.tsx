import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "../../../app/profile/page";
import '@testing-library/jest-dom';


// Mock useRouter from next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ProfilePage", () => {
  let fetchMock;
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => "mock-token"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });
    global.fetch = jest.fn();
    mockPush.mockClear();
  });

  it("renders profile page with user info", async () => {
    const fetchMock = jest.fn();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: "Jane Doe", email: "jane@example.com" })
    });
    global.fetch = fetchMock;
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Change Password/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Back to Dashboard/i })).toBeInTheDocument();
    });
  });

  it("allows editing and saving the name", async () => {
    const fetchMock = jest.fn();
    (fetchMock as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: "Jane Doe", email: "jane@example.com" })
    });
    global.fetch = fetchMock;

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText(/Edit Name/i));

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: "Janet Doe" } });

    const fetchMockSave = jest.fn();
    (fetchMockSave as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: "Janet Doe" }) // Return updated name if component uses it
    });
    global.fetch = fetchMockSave;

    fireEvent.click(screen.getByLabelText(/Save Name/i));

    await waitFor(() => {
      expect(screen.getByText(/Name updated successfully/i)).toBeInTheDocument();
      // Check the Edit Name button's value attribute for Janet Doe
      expect(screen.getByLabelText(/Edit Name/i)).toHaveAttribute("value", "Janet Doe");
    });
  });

  it("opens and closes change password dialog", async () => {
    const fetchMock = jest.fn();
    (fetchMock as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: "Jane Doe", email: "jane@example.com" })
    });
    global.fetch = fetchMock;
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument(); // Dialog is open
    expect(screen.getByRole("heading", { name: /Change Password/i })).toBeInTheDocument(); // Dialog title
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    // Wait for the dialog title to disappear (dialog closed)
    await waitFor(() => expect(screen.queryByRole("heading", { name: /Change Password/i })).not.toBeInTheDocument());
  });

  it("navigates back to dashboard", async () => {
    const fetchMock = jest.fn();
    (fetchMock as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: "Jane Doe", email: "jane@example.com" })
    });
    global.fetch = fetchMock;
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Back to Dashboard/i }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
