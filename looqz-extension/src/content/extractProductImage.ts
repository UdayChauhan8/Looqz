export function extractProductImageUrl(): string | null {
  // Strategy 1: Open Graph
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.getAttribute("content")) {
    return ogImage.getAttribute("content");
  }

  // Strategy 2: Schema.org Product JSON-LD
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of jsonLdScripts) {
    try {
      const parsed = JSON.parse(script.textContent || "{}");
      
      // Helper function to process a node recursively
      const findProductImage = (node: any): string | null => {
        if (!node) return null;
        
        if (Array.isArray(node)) {
          for (const item of node) {
            const result = findProductImage(item);
            if (result) return result;
          }
          return null;
        }

        // Check if node is a Product
        if (node["@type"] === "Product" || (Array.isArray(node["@type"]) && node["@type"].includes("Product"))) {
          if (node.image) {
            if (typeof node.image === "string") return node.image;
            if (Array.isArray(node.image) && node.image.length > 0) {
              if (typeof node.image[0] === "string") return node.image[0];
            }
            if (typeof node.image === "object" && node.image.url) {
              return node.image.url;
            }
          }
        }

        // Recurse into object properties (e.g., @graph wrapper)
        if (typeof node === "object") {
          for (const key in node) {
            const result = findProductImage(node[key]);
            if (result) return result;
          }
        }

        return null;
      };

      const result = findProductImage(parsed);
      if (result) return result;
    } catch (e) {
      // Ignore parse errors on individual scripts
    }
  }

  // Strategy 3: Twitter card
  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage && twitterImage.getAttribute("content")) {
    return twitterImage.getAttribute("content");
  }

  // Strategy 4: Largest visible <img> heuristic
  const images = Array.from(document.querySelectorAll("img[src]")) as HTMLImageElement[];
  
  const validImages = images.filter(img => {
    // Basic dimension check
    if (img.naturalWidth <= 200 || img.naturalHeight <= 200) return false;
    
    // Filter out UI elements
    const src = img.src.toLowerCase();
    const excludeKeywords = ["logo", "icon", "banner", "sprite", "placeholder", "avatar"];
    if (excludeKeywords.some(keyword => src.includes(keyword))) {
      return false;
    }
    
    return true;
  });

  if (validImages.length === 0) return null;

  // Sort by area descending
  validImages.sort((a, b) => {
    const areaA = a.naturalWidth * a.naturalHeight;
    const areaB = b.naturalWidth * b.naturalHeight;
    return areaB - areaA;
  });

  return validImages[0].src;
}

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "GET_PRODUCT_IMAGE") {
      sendResponse({ url: extractProductImageUrl() });
    }
    return true; // keep channel open for async response
  });
}
