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
        `<img data-key="${dataKey}" style="position: relative;" data-image-editable="true" data-original-classes="${classes}"`
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
        `<video data-key="${dataKey}" style="position: relative;" data-image-editable="true" data-original-classes="${classes}"`
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
  console.log('Starting image finalization process');

  // Deep clone to avoid mutations
  const finalPage = JSON.parse(JSON.stringify(modifiedPage));

  // Track changes for logging
  let changedImages = 0;

  finalPage.sections = finalPage.sections.map((section: any) => {
    if (!section.src?.html) return section;

    let finalHtml = section.src.html;

    // Find all data-key attributes to ensure we process all image elements
    const dataKeyRegex = /data-key="([^"]+)"/g;
    let match;
    const processedKeys = new Set();

    while ((match = dataKeyRegex.exec(finalHtml)) !== null) {
      const dataKey = match[1];
      if (processedKeys.has(dataKey)) continue;
      processedKeys.add(dataKey);

      const imageData = imageContentMap[dataKey];
      if (!imageData || imageData.sectionId !== section.id) continue;

      // Check if this image has changes
      const hasChanges =
        imageData.currentSrc !== imageData.originalSrc ||
        imageData.currentAlt !== imageData.originalAlt ||
        imageData.currentClasses !== imageData.originalClasses;

      if (hasChanges) {
        changedImages++;
        console.log(`Applying changes to image ${dataKey}:`, {
          originalSrc: imageData.originalSrc,
          newSrc: imageData.currentSrc,
          originalAlt: imageData.originalAlt,
          newAlt: imageData.currentAlt,
          originalClasses: imageData.originalClasses,
          newClasses: imageData.currentClasses,
        });
      }

      // Replace the element in HTML with updated attributes
      const elementRegex = new RegExp(`<(img|video)[^>]*data-key="${dataKey}"[^>]*>`, 'g');

      finalHtml = finalHtml.replace(elementRegex, (elementMatch: string) => {
        let updatedElement = elementMatch;

        // Apply changes only if there are any
        if (hasChanges) {
          // Update src attribute
          if (imageData.currentSrc !== imageData.originalSrc) {
            updatedElement = updatedElement.replace(/src="[^"]*"/, `src="${imageData.currentSrc}"`);
          }

          // Update alt attribute for images
          if (imageData.elementType === 'img' && imageData.currentAlt !== imageData.originalAlt) {
            if (updatedElement.includes('alt="')) {
              updatedElement = updatedElement.replace(
                /alt="[^"]*"/,
                `alt="${imageData.currentAlt}"`
              );
            } else {
              updatedElement = updatedElement.replace(
                /data-key=/,
                `alt="${imageData.currentAlt}" data-key=`
              );
            }
          }

          // Update class attribute
          if (imageData.currentClasses !== imageData.originalClasses) {
            if (updatedElement.includes('class="')) {
              updatedElement = updatedElement.replace(
                /class="[^"]*"/,
                `class="${imageData.currentClasses}"`
              );
            } else {
              updatedElement = updatedElement.replace(
                /data-key=/,
                `class="${imageData.currentClasses}" data-key=`
              );
            }
          }
        }

        // Always remove editing-specific attributes
        updatedElement = updatedElement.replace(/\s*data-key="[^"]*"/g, '');
        updatedElement = updatedElement.replace(/\s*data-image-editable="[^"]*"/g, '');
        updatedElement = updatedElement.replace(/\s*data-original-classes="[^"]*"/g, '');
        updatedElement = updatedElement.replace(/\s*style="[^"]*"/g, '');

        return updatedElement;
      });
    }

    return {
      ...section,
      src: {
        ...section.src,
        html: finalHtml,
      },
    };
  });

  console.log(`Finalization complete: ${changedImages} images updated`);
  return finalPage;
}
