import React, { useEffect } from "react";
import {
  useEditorContext,
  PasteEvent,
  EditorState,
  EditorDispatch,
} from "../../EditorContext";
import { isSelectionInMarkdownLink } from "./isSelectionInMarkdownLink";

// Enable debug logging
const DEBUG = true;
const log = (...args: unknown[]): void => DEBUG && console.log(...args);

// Helper to check if a string is a valid URL
const isValidHttpUrl = (string: string): boolean => {
  let url;
  try {
    url = new URL(string);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

const AutoLinkPlugin: React.FC = () => {
  const { state, dispatch, registerPlugin } = useEditorContext();

  useEffect(() => {
    // Define the plugin handlers
    const pasteHandler = (
      event: PasteEvent,
      state: EditorState,
      dispatch: EditorDispatch,
    ) => {
      const { clipboardData, nativeEvent } = event;
      const { selectionStart, selectionEnd, text } = state;
      const pastedText = clipboardData.getData("text/plain");

      // Only handle if pasted text is a valid URL and text is selected
      if (!isValidHttpUrl(pastedText) || selectionStart === selectionEnd) {
        return false;
      }

      // Check if selection is already part of a markdown link
      if (isSelectionInMarkdownLink(text, selectionStart, selectionEnd)) {
        return false;
      }

      nativeEvent.preventDefault();

      log(`Creating markdown link with URL: ${pastedText}`);

      // Use ADD_PREFIX_POSTFIX to wrap the selection while maintaining it
      dispatch({
        type: "ADD_PREFIX_POSTFIX",
        payload: {
          prefix: "[",
          postfix: `](${pastedText})`,
        },
      });

      return true; // Handled
    };

    // Register the plugin with the EditorComposer
    const unregister = registerPlugin("auto-link-plugin", {
      paste: pasteHandler,
    });

    // Return cleanup function
    return unregister;
  }, [state, dispatch, registerPlugin]);

  // This component doesn't render anything
  return null;
};

// Export the helper function for testing
export { isSelectionInMarkdownLink };
export default AutoLinkPlugin;
