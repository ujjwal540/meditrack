import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MedicineForm } from "@/components/medicine/MedicineForm";

describe("MedicineForm", () => {
  it("shows validation errors and does not save incomplete data", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MedicineForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /save medicine and schedule/i }));

    expect(screen.getByText("Enter the medicine name.")).toBeVisible();
    expect(screen.getByText("Enter the prescribed dosage.")).toBeVisible();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves a valid medicine", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MedicineForm onSave={onSave} />);

    await user.type(screen.getByPlaceholderText("e.g. Vitamin D"), "Vitamin D");
    await user.type(screen.getByPlaceholderText("e.g. 1 tablet"), "1 tablet");
    await user.click(screen.getByRole("button", { name: /save medicine and schedule/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Vitamin D",
        dosage: "1 tablet",
        times: ["08:00"],
      }),
    );
  });
});
