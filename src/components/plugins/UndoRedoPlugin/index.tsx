import React, { useEffect } from "react";
import {
  useEditorContext,
  KeyDownEvent,
  EditorState,
  EditorDispatch,
} from "../../EditorContext";

const UndoRedoPlugin: React.FC = () => {
  const { dispatch, registerPlugin } = useEditorContext();

  useEffect(() => {
    // Define the plugin handlers
    const keyDownHandler = (
      event: KeyDownEvent,
      _state: EditorState,
      dispatch: EditorDispatch,
    ) => {
      const { key, ctrlKey, metaKey, shiftKey, nativeEvent } = event;

      // Detect if Cmd/Ctrl is pressed
      const isModifierActive = metaKey || ctrlKey;

      // Undo with Cmd/Ctrl+Z
      if (isModifierActive && key === "z" && !shiftKey) {
        nativeEvent.preventDefault();
        dispatch({ type: "UNDO" });
        return true; // Handled
      }

      // Redo with Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y (Windows)
      if (
        (isModifierActive && key === "z" && shiftKey) ||
        (isModifierActive && key === "y")
      ) {
        nativeEvent.preventDefault();
        dispatch({ type: "REDO" });
        return true; // Handled
      }

      return false; // Not handled
    };

    // Register the plugin with the EditorComposer
    const unregister = registerPlugin("undo-redo-plugin", {
      keyDown: keyDownHandler,
    });

    // Return cleanup function
    return unregister;
  }, [dispatch, registerPlugin]);

  return null;
};

export default UndoRedoPlugin;
