import React, { useEffect } from "react";
import {
  useEditorContext,
  KeyDownEvent,
  EditorState,
  EditorDispatch,
} from "../../EditorContext";

const BoldPlugin: React.FC = () => {
  const { state, dispatch, registerPlugin } = useEditorContext();

  useEffect(() => {
    // Define the plugin handlers
    const keyDownHandler = (
      event: KeyDownEvent,
      state: EditorState,
      dispatch: EditorDispatch,
    ) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey, nativeEvent } = event;
      const { selectionStart, selectionEnd } = state;

      // Only handle when text is selected
      if (selectionStart === selectionEnd) {
        return false;
      }

      // Detect if Cmd/Ctrl is pressed
      const isModifierActive = metaKey || ctrlKey;

      // Bold with Cmd/Ctrl+B
      if (isModifierActive && key === "b" && !altKey && !shiftKey) {
        nativeEvent.preventDefault();

        dispatch({
          type: "ADD_PREFIX_POSTFIX",
          payload: {
            prefix: "**",
            postfix: "**",
          },
        });
        return true; // Handled
      }

      return false; // Not handled
    };

    // Register the plugin with the EditorComposer
    const unregister = registerPlugin("bold-plugin", {
      keyDown: keyDownHandler,
    });

    // Return cleanup function
    return unregister;
  }, [state, dispatch, registerPlugin]);

  return null;
};

export default BoldPlugin;
