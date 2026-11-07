import { Decimal } from "decimal.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    templeSettings: {
      findFirst: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import { PaymentService } from "@/lib/payments/PaymentService";

describe("PaymentService", () => {
  const findTempleSettings = vi.mocked(db.templeSettings.findFirst);

  beforeEach(() => {
    findTempleSettings.mockReset();
  });

  it("creates a Manual UPI order from temple settings", async () => {
    findTempleSettings.mockResolvedValue({
      upiId: "vinayagar@upi",
      templeNameEn: "Sakthi Vinayagar Temple",
    } as never);

    const service = new PaymentService();
    const order = await service.createPayment("MANUAL_UPI", {
      amount: new Decimal("1500.00"),
      donorName: "Test Devotee",
      referenceId: "donation-12345",
    });

    expect(order).toMatchObject({
      providerOrderId: "UPI-donation-12345",
      providerType: "MANUAL_UPI",
    });
    expect(order.qrData).toContain("upi://pay?pa=vinayagar%40upi");
    expect(order.qrData).toContain("pn=Sakthi%20Vinayagar%20Temple");
    expect(order.qrData).toContain("am=1500.00");
  });

  it("rejects automated webhooks for manual UPI payments", async () => {
    const service = new PaymentService();

    await expect(service.getProvider("MANUAL_UPI").verifyWebhook("payload", "signature")).resolves.toMatchObject({
      isValid: false,
      error: "Manual UPI provider does not support automated webhooks.",
    });
  });

  it("rejects an unregistered payment provider", () => {
    const service = new PaymentService();

    expect(() => service.getProvider("UNKNOWN")).toThrow("not registered or supported");
  });
});
