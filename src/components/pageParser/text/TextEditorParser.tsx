import { WebsitePage } from '@/types/mock';
export interface TextContentMap {
  [dataKey: string]: {
    originalText: string;
    currentText: string;
    originalHtml: string; // Add this to preserve HTML structure
  };
}

const generateDataKey = (): string => {
  return `data-key-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Pre-processes HTML to add data-key attributes and contenteditable to text elements
 * Returns both the modified HTML and a map of data-keys to text content
 */
export function prepareHtmlForTextEditing(html: string): {
  modifiedHtml: string;
  textContentMap: TextContentMap;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textContentMap: TextContentMap = {};

  /**
   * Non-destructive processing - only adds attributes, never removes elements
   */
  function processElement(element: Element): void {
    // Skip elements that should never be editable
    const skipTags = [
      'script',
      'style',
      'meta',
      'link',
      'head',
      'title',
      'noscript',
      'iframe',
      'object',
      'embed',
    ];

    if (skipTags.includes(element.tagName.toLowerCase())) {
      return;
    }

    // Skip if already processed
    if (element.hasAttribute('data-key')) {
      // Still process children that might not be processed
      Array.from(element.children).forEach(child => processElement(child));
      return;
    }

    // Check if this element should be made editable
    if (shouldMakeElementEditable(element)) {
      const dataKey = generateDataKey();
      const elementText = element.textContent?.trim() || '';

      // Add attributes for text editing - NON-DESTRUCTIVE
      element.setAttribute('data-key', dataKey);
      element.setAttribute('contenteditable', 'true');
      element.setAttribute('data-text-editable', 'true');

      // Add a backup of original content
      element.setAttribute('data-original-text', elementText);

      // Store in our map
      textContentMap[dataKey] = {
        originalText: elementText,
        currentText: elementText,
        originalHtml: element.innerHTML,
      };

      // DON'T process children of editable elements to avoid nested editing
      return;
    }

    // ALWAYS process children - this ensures we don't lose any elements
    Array.from(element.children).forEach(child => processElement(child));
  }

  /**
   * Conservative decision logic - only make obviously text elements editable
   */
  function shouldMakeElementEditable(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || '';

    // Must have some text content
    if (!textContent || textContent.length < 1) {
      return false;
    }

    // 1. Definitely text elements
    const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'b', 'i'];
    if (textTags.includes(tagName)) {
      return true;
    }

    // 2. Interactive text elements
    const interactiveTags = ['button', 'label', 'legend', 'caption'];
    if (interactiveTags.includes(tagName)) {
      return true;
    }

    // 3. List items and table cells
    if (['li', 'td', 'th', 'dt', 'dd'].includes(tagName)) {
      return true;
    }

    // 4. Quote elements
    if (['blockquote', 'cite', 'q'].includes(tagName)) {
      return true;
    }

    // 5. Simple links (only if they don't contain complex children)
    if (tagName === 'a') {
      const children = Array.from(element.children);
      const hasComplexChildren = children.some(child => {
        const childTag = child.tagName.toLowerCase();
        return !['span', 'strong', 'em', 'b', 'i', 'small'].includes(childTag);
      });
      return !hasComplexChildren;
    }

    // 6. Simple containers with obvious text classes
    if (['div', 'span'].includes(tagName)) {
      const className = element.getAttribute('class') || '';
      const textClasses = ['title', 'heading', 'text', 'content', 'description', 'label'];
      const hasTextClass = textClasses.some(cls => className.toLowerCase().includes(cls));

      if (hasTextClass) {
        // Only if it's a simple container
        const children = Array.from(element.children);
        return children.length <= 2;
      }

      // Leaf text nodes
      if (element.children.length === 0 && textContent.length > 0) {
        return true;
      }
    }

    return false;
  }

  // Process all elements starting from documentElement to preserve structure
  if (doc.documentElement) {
    processElement(doc.documentElement);
  }

  const serializer = new XMLSerializer();
  const modifiedHtml = serializer.serializeToString(doc.documentElement);

  return {
    modifiedHtml: `<!DOCTYPE html>\n${modifiedHtml}`,
    textContentMap,
  };
}

/**
 * Removes editing attributes and injects updated text content back into HTML
 */
export function finalizeHtmlFromTextEditing(html: string, textContentMap: TextContentMap): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Update text content and remove editing attributes
  Object.entries(textContentMap).forEach(([dataKey, contentData]) => {
    const element = doc.querySelector(`[data-key="${dataKey}"]`);
    if (element) {
      // Use the current text, but try to preserve HTML structure if possible
      if (contentData.currentText !== contentData.originalText) {
        // Text was changed, replace with plain text
        element.textContent = contentData.currentText;
      }
      // If text wasn't changed, leave the original HTML structure intact
      if (contentData.currentText !== contentData.originalText) {
        element.classList.add('text-wrap'); // Optional: add classes for better text wrapping
        element.classList.add('break-words'); // Optional: add classes for better text wrapping
        element.classList.add('overflow-hidden');
      }
      element.removeAttribute('data-key');
      element.removeAttribute('contenteditable');
      element.removeAttribute('data-text-editable');
      element.removeAttribute('data-original-text');
    }
  });

  const serializer = new XMLSerializer();
  return `<!DOCTYPE html>\n${serializer.serializeToString(doc.documentElement)}`;
}

/**
 * Processes all page sections for text editing
 */
export function preparePageForTextEditing(page: WebsitePage): {
  modifiedPage: WebsitePage;
  globalTextContentMap: TextContentMap;
} {
  const modifiedPage = { ...page };
  const globalTextContentMap: TextContentMap = {};

  modifiedPage.sections = page.sections.map(section => {
    if (!section.src?.html) return section;

    const { modifiedHtml, textContentMap } = prepareHtmlForTextEditing(section.src.html);

    // Merge into global map
    Object.assign(globalTextContentMap, textContentMap);

    return {
      ...section,
      src: {
        ...section.src,
        html: modifiedHtml,
      },
    };
  });

  return { modifiedPage, globalTextContentMap };
}

/**
 * Finalizes all page sections from text editing
 */
export function finalizePageFromTextEditing(
  page: WebsitePage,
  textContentMap: TextContentMap
): WebsitePage {
  const finalizedPage = { ...page };

  finalizedPage.sections = page.sections.map(section => {
    if (!section.src?.html) return section;

    const finalizedHtml = finalizeHtmlFromTextEditing(section.src.html, textContentMap);

    return {
      ...section,
      src: {
        ...section.src,
        html: finalizedHtml,
      },
    };
  });

  return finalizedPage;
}
