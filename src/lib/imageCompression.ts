/**
 * Compresses an image from a Data URL (base64) using HTML5 Canvas.
 * Downscales to a maximum boundary (e.g. 600px width/height) and compresses quality to 0.65.
 */
export function compressImage(dataUrl: string, maxWidth = 600, maxHeight = 400, quality = 0.65): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a data URL, return it as-is
    if (!dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions preserving aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl); // fallback
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as compressed jpeg
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(dataUrl); // fallback if image load fails
    };

    img.src = dataUrl;
  });
}
