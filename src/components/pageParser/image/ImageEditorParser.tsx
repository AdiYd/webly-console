'use client';

export interface ImageContentMap {
  [dataKey: string]: {
    originalSrc: string;
    currentSrc: string;
    originalAlt: string;
    currentAlt: string;
    originalClasses: string;
    currentClasses: string;
    elementType: 'img' | 'video' | 'background';
    sectionId: string;
    xpath: string;
  };
}

export function preparePageForImageEditing(page: any): {
  modifiedPage: any;
  globalImageContentMap: ImageContentMap;
} {
  const globalImageContentMap: ImageContentMap = {};
  let imageCounter = 0;

  // Deep clone the page to avoid mutations
  const modifiedPage = JSON.parse(JSON.stringify(page));

  // Process each section
  modifiedPage.sections = modifiedPage.sections.map((section: any) => {
    if (!section.src?.html) return section;

    let modifiedHtml = section.src.html;

    // Find all images, videos, and background images
    const imageRegex = /<img[^>]*>/gi;
    const videoRegex = /<video[^>]*>/gi;
    const backgroundRegex = /style="[^"]*background-image:\s*url\([^)]+\)[^"]*"/gi;

    // Process regular images
    modifiedHtml = modifiedHtml.replace(imageRegex, (match: string) => {
      const dataKey = `image-${imageCounter++}`;
      const srcMatch = match.match(/src="([^"]*)"/);
      const altMatch = match.match(/alt="([^"]*)"/);
      const classMatch = match.match(/class="([^"]*)"/);

      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      const classes = classMatch ? classMatch[1] : '';

      globalImageContentMap[dataKey] = {
        originalSrc: src,
        currentSrc: src,
        originalAlt: alt,
        currentAlt: alt,
        originalClasses: classes,
        currentClasses: classes,
        elementType: 'img',
        sectionId: section.id,
        xpath: `//img[@data-key="${dataKey}"]`,
      };

      // Add data attributes for image editing
      return match.replace(
        /<img/,
        `<img data-key="${dataKey}" data-image-editable="true" data-original-classes="${classes}"`
      );
    });

    // Process videos
    modifiedHtml = modifiedHtml.replace(videoRegex, (match: string) => {
      const dataKey = `video-${imageCounter++}`;
      const srcMatch = match.match(/src="([^"]*)"/);
      const classMatch = match.match(/class="([^"]*)"/);

      const src = srcMatch ? srcMatch[1] : '';
      const classes = classMatch ? classMatch[1] : '';

      globalImageContentMap[dataKey] = {
        originalSrc: src,
        currentSrc: src,
        originalAlt: '',
        currentAlt: '',
        originalClasses: classes,
        currentClasses: classes,
        elementType: 'video',
        sectionId: section.id,
        xpath: `//video[@data-key="${dataKey}"]`,
      };

      return match.replace(
        /<video/,
        `<video data-key="${dataKey}" data-image-editable="true" data-original-classes="${classes}"`
      );
    });

    return {
      ...section,
      src: {
        ...section.src,
        html: modifiedHtml,
      },
    };
  });

  return { modifiedPage, globalImageContentMap };
}

export function finalizePageFromImageEditing(
  modifiedPage: any,
  imageContentMap: ImageContentMap
): any {
  const finalPage = JSON.parse(JSON.stringify(modifiedPage));

  finalPage.sections = finalPage.sections.map((section: any) => {
    if (!section.src?.html) return section;

    let finalHtml = section.src.html;

    // Apply only changed image properties
    Object.entries(imageContentMap).forEach(([dataKey, imageData]) => {
      if (imageData.sectionId !== section.id) return;

      // Skip if no changes were made to this image
      const hasChanges =
        imageData.currentSrc !== imageData.originalSrc ||
        imageData.currentAlt !== imageData.originalAlt ||
        imageData.currentClasses !== imageData.originalClasses;

      if (!hasChanges) return;

      const dataKeyRegex = new RegExp(`data-key="${dataKey}"[^>]*>`, 'g');

      finalHtml = finalHtml.replace(dataKeyRegex, (match: string) => {
        let updatedMatch = match;

        // Update src only if changed
        if (imageData.currentSrc !== imageData.originalSrc) {
          updatedMatch = updatedMatch.replace(/src="[^"]*"/, `src="${imageData.currentSrc}"`);
        }

        // Update alt for images only if changed
        if (imageData.elementType === 'img' && imageData.currentAlt !== imageData.originalAlt) {
          if (match.includes('alt="')) {
            updatedMatch = updatedMatch.replace(/alt="[^"]*"/, `alt="${imageData.currentAlt}"`);
          } else {
            updatedMatch = updatedMatch.replace(
              /data-key="[^"]*"/,
              `alt="${imageData.currentAlt}" data-key="${dataKey}"`
            );
          }
        }

        // Update classes only if changed
        if (imageData.currentClasses !== imageData.originalClasses) {
          updatedMatch = updatedMatch.replace(
            /class="[^"]*"/,
            `class="${imageData.currentClasses}"`
          );
        }

        // Remove editing-specific attributes
        updatedMatch = updatedMatch.replace(/\s*data-key="[^"]*"/g, '');
        updatedMatch = updatedMatch.replace(/\s*data-image-editable="[^"]*"/g, '');
        updatedMatch = updatedMatch.replace(/\s*data-original-classes="[^"]*"/g, '');

        return updatedMatch;
      });
    });

    return {
      ...section,
      src: {
        ...section.src,
        html: finalHtml,
      },
    };
  });

  return finalPage;
}
