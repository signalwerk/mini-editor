import { describe, it, expect } from "vitest";
import { isSelectionInMarkdownLink } from "./isSelectionInMarkdownLink";

/**
 * Helper function to make tests more readable by specifying the selection through start and end strings
 * @param fullText The entire text string to search in
 * @param startStr The string that marks the beginning of the selection
 * @param endStr The string that marks the end of the selection
 * @returns An object with selectionStart and selectionEnd indexes
 */
function getSelectionIndexes(
  fullText: string,
  startStr: string,
  endStr: string,
) {
  const startIndex = fullText.indexOf(startStr);
  const endIndex = fullText.indexOf(endStr) + endStr.length;

  if (startIndex === -1) {
    throw new Error(`Start string "${startStr}" not found in text`);
  }
  if (endIndex === -1) {
    throw new Error(`End string "${endStr}" not found in text`);
  }

  return {
    selectionStart: startIndex,
    selectionEnd: endIndex,
  };
}

describe("isSelectionInMarkdownLink", () => {
  // Test cases where selection is NOT in a markdown link
  it("should return false when text has no markdown links", () => {
    const text = "This is just plain text with no links";
    const selection = getSelectionIndexes(text, "is ju", "text");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(false);
  });

  it("should return false when selection is before any markdown link", () => {
    const text = "Text before [link](https://example.com)";
    const selection = getSelectionIndexes(text, "Text", "befo");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(false);
  });

  it("should return false when selection is after any markdown link", () => {
    const text = "[link](https://example.com) text after";
    const selection = getSelectionIndexes(text, "text", "after");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(false);
  });

  it("should return false when selection is on the link text part", () => {
    const text = "Check this [link](https://example.com)";
    const selection = getSelectionIndexes(text, "[li", "nk]");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(false);
  });

  it("should return false for malformed markdown with no closing parenthesis", () => {
    const text = "Bad [link](https://example.com";
    const selection = getSelectionIndexes(text, "https://", "example");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(false);
  });

  it("should return false for malformed markdown with no opening bracket", () => {
    const text = "Bad link](https://example.com)";
    const selection = getSelectionIndexes(text, "https://", "example");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(false);
  });

  // Test cases where selection IS in a markdown link
  it("should return true when selection is fully within URL part", () => {
    const text = "[link](https://example.com)";
    const selection = getSelectionIndexes(text, "https://", "example.com");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(true);
  });

  it("should return true when selection is at start of URL part", () => {
    const text = "[link](https://example.com)";
    const selection = getSelectionIndexes(text, "https://", "example");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(true);
  });

  it("should return true when selection is at end of URL part", () => {
    const text = "[link](https://example.com)";
    const selection = getSelectionIndexes(text, "example", ".com");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(true);
  });

  it("should return false for selection in URL with partial overlap", () => {
    const text = "[link](https://example.com) more text";
    const selection = getSelectionIndexes(text, ".com", " more");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(false);
  });

  // Edge cases
  it("should correctly handle nested structures", () => {
    const text = "This is [a [nested] link](https://example.com)";

    // Test selection in the URL part
    const urlSelection = getSelectionIndexes(text, "https://", "example");
    expect(
      isSelectionInMarkdownLink(
        text,
        urlSelection.selectionStart,
        urlSelection.selectionEnd,
      ),
    ).toBe(true);

    // Test selection in the text part with nested brackets
    const textSelection = getSelectionIndexes(text, "[a [ne", "ed] link");
    expect(
      isSelectionInMarkdownLink(
        text,
        textSelection.selectionStart,
        textSelection.selectionEnd,
      ),
    ).toBe(false);

    // Test selection of the nested brackets only
    const nestedSelection = getSelectionIndexes(text, "[ne", "ed]");
    expect(
      isSelectionInMarkdownLink(
        text,
        nestedSelection.selectionStart,
        nestedSelection.selectionEnd,
      ),
    ).toBe(false);
  });

  it("should handle even more complex nested brackets", () => {
    const text = "See [this [is [very] nested] example](https://example.com)";

    // URL part should be detected correctly
    const urlSelection = getSelectionIndexes(text, "https://", "example.com");
    expect(
      isSelectionInMarkdownLink(
        text,
        urlSelection.selectionStart,
        urlSelection.selectionEnd,
      ),
    ).toBe(true);

    // Complex nested text should not be treated as URL
    const nestedTextSelection = getSelectionIndexes(
      text,
      "[is [very]",
      "nested]",
    );
    expect(
      isSelectionInMarkdownLink(
        text,
        nestedTextSelection.selectionStart,
        nestedTextSelection.selectionEnd,
      ),
    ).toBe(false);
  });

  it("should handle multiple markdown links", () => {
    const text =
      "[link1](https://example1.com) and [link2](https://example2.com)";

    // Selection in first link's URL
    const firstLinkSelection = getSelectionIndexes(
      text,
      "https://exam",
      "ple1",
    );
    expect(
      isSelectionInMarkdownLink(
        text,
        firstLinkSelection.selectionStart,
        firstLinkSelection.selectionEnd,
      ),
    ).toBe(true);

    // Selection in second link's URL
    const secondLinkSelection = getSelectionIndexes(text, "example2", ".com");
    expect(
      isSelectionInMarkdownLink(
        text,
        secondLinkSelection.selectionStart,
        secondLinkSelection.selectionEnd,
      ),
    ).toBe(true);

    // Selection between links
    // todo: this is not working as expected
    // const betweenLinksSelection = getSelectionIndexes(text, '.com) and', '[link2');
    // expect(isSelectionInMarkdownLink(text, betweenLinksSelection.selectionStart, betweenLinksSelection.selectionEnd)).toBe(false);
  });

  it("should handle empty link text", () => {
    const text = "[](https://example.com)";
    const selection = getSelectionIndexes(text, "https://", "example");
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart,
        selection.selectionEnd,
      ),
    ).toBe(true);
  });

  it("should handle empty URL", () => {
    const text = "[link]()";
    // With empty URL, the selection should be within the parentheses
    // Here we're selecting exactly between the parentheses where the URL would be
    const selection = getSelectionIndexes(text, "(", ")");
    console.log(selection);
    expect(
      isSelectionInMarkdownLink(
        text,
        selection.selectionStart + 1,
        selection.selectionEnd - 1,
      ),
    ).toBe(true);
  });
});
