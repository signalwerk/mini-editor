/**
 * Checks if the selected text is within a Markdown link.
 *
 * @param text - The entire text.
 * @param selectionStart - The start index of the selection.
 * @param selectionEnd - The end index of the selection.
 * @returns A boolean indicating whether the selection is within a Markdown link.
 */
export const isSelectionInMarkdownLink = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
): boolean => {
  // Search backwards for the nearest preceding "](" to the selection start
  const sliceStart = text.substring(0, selectionStart);
  const openParenIndex = sliceStart.lastIndexOf("](");

  // If "](" found, find the corresponding opening "["
  if (openParenIndex !== -1) {
    // Find the matching opening bracket by counting brackets backwards
    let bracketCount = 1; // we already found one closing bracket before "("
    let openBracketIndex = -1;

    // Scan backwards to find the matching opening bracket
    for (let i = openParenIndex - 1; i >= 0; i--) {
      if (text[i] === "]") bracketCount++;
      if (text[i] === "[") {
        bracketCount--;
        if (bracketCount === 0) {
          openBracketIndex = i;
          break;
        }
      }
    }

    // If no matching opening bracket found
    if (openBracketIndex === -1) {
      return false;
    }

    // Search forward for the nearest following ")" from the selection end
    const sliceEnd = text.substring(selectionEnd);
    const closeParenIndex = sliceEnd.indexOf(")");

    // If ")" found and it's the correct closing parenthesis for the found "]("
    if (closeParenIndex !== -1) {
      // Calculate the URL part boundaries
      const urlStart = openParenIndex + 2; // Skip past "]("
      const urlEnd = text.length - sliceEnd.length + closeParenIndex; // Position of closing ")"

      // Check if selection is within the URL part
      if (selectionStart >= urlStart && selectionEnd <= urlEnd) {
        return true;
      }
    }
  }

  // Default case: The selection is not within a markdown link's URL
  return false;
};
