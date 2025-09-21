import { dateFormat } from "../utils/dateformat";
import { describe, it, expect } from "vitest";

describe("dateFormat", () => {
  it("should format 2025-07-09 as 09/07/2025", () => {
    expect(dateFormat("2025-07-09")).toBe("09/07/2025");
  });
  it("should format 2024-01-01 as 01/01/2024", () => {
    expect(dateFormat("2024-01-01")).toBe("01/01/2024");
  });
});
