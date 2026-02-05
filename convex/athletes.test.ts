import { describe, it, expect } from "vitest";
import { normalizeAthleteName, MAX_NAME_LENGTH } from "./athletes";

describe("normalizeAthleteName", () => {
  it("lowercases the name", () => {
    expect(normalizeAthleteName("LeBron James")).toBe("lebron james");
  });

  it("trims whitespace", () => {
    expect(normalizeAthleteName("  Kobe Bryant  ")).toBe("kobe bryant");
  });

  it("strips diacritics (accented characters)", () => {
    expect(normalizeAthleteName("José Altuve")).toBe("jose altuve");
    expect(normalizeAthleteName("Ángel Di María")).toBe("angel di maria");
    expect(normalizeAthleteName("Müller")).toBe("muller");
    expect(normalizeAthleteName("Grégoire")).toBe("gregoire");
  });

  it("treats names differing only by accents as duplicates", () => {
    const a = normalizeAthleteName("José");
    const b = normalizeAthleteName("Jose");
    expect(a).toBe(b);
  });

  it("treats names differing only by case as duplicates", () => {
    const a = normalizeAthleteName("LEBRON JAMES");
    const b = normalizeAthleteName("lebron james");
    expect(a).toBe(b);
  });

  it("handles empty string after trim", () => {
    expect(normalizeAthleteName("   ")).toBe("");
  });

  it("handles single character names", () => {
    expect(normalizeAthleteName("A")).toBe("a");
  });

  it("preserves hyphens and apostrophes", () => {
    expect(normalizeAthleteName("O'Brien")).toBe("o'brien");
    expect(normalizeAthleteName("Jean-Pierre")).toBe("jean-pierre");
  });
});

describe("MAX_NAME_LENGTH", () => {
  it("is 100 characters", () => {
    expect(MAX_NAME_LENGTH).toBe(100);
  });
});
