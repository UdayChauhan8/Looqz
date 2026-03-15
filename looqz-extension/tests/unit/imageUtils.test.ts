import { describe, it, expect } from "vitest";
import {
  isValidImageType,
  isValidImageSize,
  formatFileSize,
} from "../../src/lib/imageUtils";

describe("imageUtils", () => {
  describe("isValidImageType", () => {
    it("accepts valid image types", () => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif",
      ];
      validTypes.forEach((type) => {
        const file = new File(["dummy"], "test.img", { type });
        expect(isValidImageType(file)).toBe(true);
      });
    });

    it("rejects invalid types like pdf or mp4", () => {
      const invalidTypes = ["application/pdf", "video/mp4", "text/plain"];
      invalidTypes.forEach((type) => {
        const file = new File(["dummy"], "test.doc", { type });
        expect(isValidImageType(file)).toBe(false);
      });
    });
  });

  describe("isValidImageSize", () => {
    it("accepts file under 10MB", () => {
      // 5MB file
      const contents = new Array(5 * 1024 * 1024).fill("a").join("");
      const file = new File([contents], "test.jpg", { type: "image/jpeg" });
      expect(isValidImageSize(file, 10)).toBe(true);
    });

    it("rejects file over 10MB", () => {
      // 11MB file
      // Instead of creating a huge array which is slow, just fake the size property using Object.defineProperty for testing logic.
      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 });
      expect(isValidImageSize(file, 10)).toBe(false);
    });
  });

  describe("formatFileSize", () => {
    it("formats bytes properly", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });
    
    it("formats KB properly", () => {
      expect(formatFileSize(1500)).toBe("1.5 KB");
    });
    
    it("formats MB properly", () => {
      expect(formatFileSize(1500000)).toBe("1.4 MB");
      expect(formatFileSize(10485760)).toBe("10.0 MB");
    });
  });
});
