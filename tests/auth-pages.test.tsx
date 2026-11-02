import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const signIn = vi.fn();
const signUp = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/auth", () => ({
  signIn: (...args: unknown[]) => signIn(...args),
  signUp: (...args: unknown[]) => signUp(...args),
}));

import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";

describe("LoginPage", () => {
  beforeEach(() => {
    push.mockReset();
    signIn.mockReset();
    signUp.mockReset();
  });

  it("submits trimmed credentials and navigates after success", async () => {
    signIn.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), " user@example.com ");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await user.click(screen.getByRole("button", { name: /log in securely/i }));

    expect(signIn).toHaveBeenCalledWith("user@example.com", "password123");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows authentication errors", async () => {
    signIn.mockResolvedValue({ ok: false, error: "Invalid credentials." });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: /log in securely/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials.");
    expect(push).not.toHaveBeenCalled();
  });
});

describe("RegisterPage", () => {
  it("validates password confirmation and terms", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test User");
    await user.type(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "password123");
    await user.type(screen.getByPlaceholderText("Repeat your password"), "different123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Passwords do not match.");
    expect(signUp).not.toHaveBeenCalled();
  });

  it("submits a valid registration and navigates after success", async () => {
    signUp.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test User");
    await user.type(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "password123");
    await user.type(screen.getByPlaceholderText("Repeat your password"), "password123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(signUp).toHaveBeenCalledWith("Test User", "user@example.com", "password123", "patient");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
