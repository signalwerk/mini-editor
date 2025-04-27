import React, { useEffect } from "react";
import {
  useEditorContext,
  KeyDownEvent,
  EditorState,
  EditorDispatch,
} from "../../EditorContext";

// Map of bracket pairs
const BRACKET_PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
  "«": "»",
};

const BracketWrapPlugin: React.FC = () => {
  const { state, dispatch, registerPlugin } = useEditorContext();

  useEffect(() => {
    // Define the plugin handlers
    const keyDownHandler = (
      event: KeyDownEvent,
      state: EditorState,
      dispatch: EditorDispatch,
    ) => {
      const { key, nativeEvent } = event;
      const { selectionStart, selectionEnd } = state;

      // Only process if there's a selection
      if (selectionStart === selectionEnd) {
        return false;
      }

      // Check if the key is an opening bracket or quote
      if (key in BRACKET_PAIRS) {
        nativeEvent.preventDefault();

        const prefix = key;
        const postfix = BRACKET_PAIRS[key];

        dispatch({
          type: "ADD_PREFIX_POSTFIX",
          payload: {
            prefix,
            postfix,
          },
        });
        return true; // Handled
      }

      return false; // Not handled
    };

    // Register the plugin with the EditorComposer
    const unregister = registerPlugin("bracket-wrap-plugin", {
      keyDown: keyDownHandler,
    });

    // Return cleanup function
    return unregister;
  }, [state, dispatch, registerPlugin]);

  return null;
};

export default BracketWrapPlugin;
