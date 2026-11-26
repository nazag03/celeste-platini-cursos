import { prisma } from "@/lib/prisma";


export async function generateOrderNumber(prefix: "CP" | "PE"): Promise<string> {
  const year = new Date().getFullYear();
  const model = prefix === "CP" ? prisma.customOrderRequest : prisma.eventBudgetRequest;
  const field = prefix === "CP" ? "orderNumber" : "requestNumber";

  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await (model as { count: (args: unknown) => Promise<number> }).count({
      where: { [field]: { startsWith: `${prefix}-${year}-` } },
    });
    const candidate = `${prefix}-${year}-${String(count + 1 + attempt).padStart(4, "0")}`;
    const exists = await (model as { findUnique: (args: unknown) => Promise<unknown> }).findUnique({
      where: { [field]: candidate },
    });
    if (!exists) return candidate;
  }

  return `${prefix}-${year}-${Date.now()}`;
}
