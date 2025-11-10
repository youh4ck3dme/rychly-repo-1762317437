import { describe, it, expect } from "vitest";

// Simple smoke test to ensure environment is set up
describe("smoke", () => {
  it("math still works", () => {
    expect(2 + 2).toBe(4);
  });
});
