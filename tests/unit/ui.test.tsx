import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Avatar, Button, Input, Textarea } from "@/components/ui";

describe("T-SETUP-05 UI kit basics", () => {
  it("Button in loading state is disabled and ignores clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("Input links its label, helper, and announced error", () => {
    render(<Input label="Invite code" helperText="Six characters." error="That code didn't work." />);
    const input = screen.getByLabelText("Invite code");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/Six characters\..*That code didn't work\./);
    expect(screen.getByText("That code didn't work.").closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
  });

  it("Textarea counter updates as you type", async () => {
    render(<Textarea label="Your answer" maxLength={500} showCount />);
    expect(screen.getByText("0/500")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Your answer"), "hello");
    expect(screen.getByText("5/500")).toBeInTheDocument();
  });

  it("Avatar exposes the name and marks Pip as AI", () => {
    render(
      <>
        <Avatar name="Maya Chen" color="pink" />
        <Avatar name="Pip" pip />
      </>,
    );
    expect(screen.getByRole("img", { name: "Maya Chen" })).toHaveTextContent("MC");
    expect(screen.getByRole("img", { name: "Pip (AI)" })).toBeInTheDocument();
  });
});
