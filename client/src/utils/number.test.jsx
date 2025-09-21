import { numberFormat } from "../utils/number";
import { describe, it, expect } from "vitest";

describe("numberFormat", () => {
  it("should format 1000 as 1,000", () => {
    expect(numberFormat(1000)).toBe("1,000");
  });
  it("should format 1234567 as 1,234,567", () => {
    expect(numberFormat(1234567)).toBe("1,234,567");
  });
  it("should format 0 as 0", () => {
    expect(numberFormat(0)).toBe("0");
  });
});
