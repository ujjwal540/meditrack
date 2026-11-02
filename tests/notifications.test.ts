import { afterEach, describe, expect, it, vi } from "vitest";
import { requestNotificationPermission } from "@/hooks/use-notifications";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser notification support", () => {
  it("reports unsupported when Notification is unavailable", async () => {
    vi.stubGlobal("Notification", undefined);

    await expect(requestNotificationPermission()).resolves.toBe("unsupported");
  });

  it("returns the browser permission result", async () => {
    vi.stubGlobal("Notification", {
      requestPermission: vi.fn().mockResolvedValue("granted"),
    });

    await expect(requestNotificationPermission()).resolves.toBe("granted");
  });

  it("does not reject when the browser throws while requesting permission", async () => {
    vi.stubGlobal("Notification", {
      requestPermission: vi.fn().mockRejectedValue(new Error("permission blocked")),
    });

    await expect(requestNotificationPermission()).resolves.toBe("unsupported");
  });
});
