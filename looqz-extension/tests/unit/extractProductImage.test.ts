/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";

// We have to mock chrome global before loading extractProductImage if it executes immediately.
// extractProductImage just adds a listener immediately, so we mock it.
global.chrome = {
  runtime: {
    onMessage: {
      addListener: () => {},
    },
  },
} as any;

import { extractProductImageUrl } from "../../src/content/extractProductImage";

function evaluateStrategy(): string | null {
  return extractProductImageUrl();
}

describe("extractProductImage", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("Returns og:image URL", () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:image");
    meta.setAttribute("content", "https://example.com/og-image.jpg");
    document.head.appendChild(meta);

    expect(evaluateStrategy()).toBe("https://example.com/og-image.jpg");
  });

  it("Returns schema.org product image (string format)", () => {
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.textContent = JSON.stringify({
      "@type": "Product",
      image: "https://example.com/schema-img.jpg"
    });
    document.head.appendChild(script);

    expect(evaluateStrategy()).toBe("https://example.com/schema-img.jpg");
  });

  it("Returns schema.org product image (array format) or @graph wrapped", () => {
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.textContent = JSON.stringify({
      "@graph": [
        {
          "@type": "Product",
          image: ["https://example.com/schema-img-array.jpg"]
        }
      ]
    });
    document.head.appendChild(script);

    expect(evaluateStrategy()).toBe("https://example.com/schema-img-array.jpg");
  });

  it("Returns twitter:image as third priority", () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "twitter:image");
    meta.setAttribute("content", "https://example.com/twitter.jpg");
    document.head.appendChild(meta);

    expect(evaluateStrategy()).toBe("https://example.com/twitter.jpg");
  });

  it("og:image takes priority over twitter:image", () => {
    const ogMeta = document.createElement("meta");
    ogMeta.setAttribute("property", "og:image");
    ogMeta.setAttribute("content", "https://example.com/og.jpg");
    document.head.appendChild(ogMeta);

    const twMeta = document.createElement("meta");
    twMeta.setAttribute("name", "twitter:image");
    twMeta.setAttribute("content", "https://example.com/twitter.jpg");
    document.head.appendChild(twMeta);

    expect(evaluateStrategy()).toBe("https://example.com/og.jpg");
  });

  it("Filters out images with logo in src", () => {
    // Add a big logo
    const img1 = document.createElement("img");
    img1.src = "https://example.com/my-logo.jpg";
    Object.defineProperty(img1, "naturalWidth", { value: 1000 });
    Object.defineProperty(img1, "naturalHeight", { value: 1000 });
    document.body.appendChild(img1);

    // Add a smaller actual product image
    const img2 = document.createElement("img");
    img2.src = "https://example.com/shirt.jpg";
    Object.defineProperty(img2, "naturalWidth", { value: 500 });
    Object.defineProperty(img2, "naturalHeight", { value: 500 });
    document.body.appendChild(img2);

    expect(evaluateStrategy()).toBe("https://example.com/shirt.jpg");
  });

  it("Returns null when nothing found", () => {
    expect(evaluateStrategy()).toBeNull();
  });
});
