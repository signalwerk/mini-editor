import React, { useRef, useEffect } from "react";
import { useEditorContext, SelectionDirection } from "./EditorContext";
import "./Editor.css";

export interface EditableProps {
  placeholder?: string;
  className?: string;
}

const Editable = ({
  placeholder = "Start typing...",
  className = "",
}: EditableProps) => {
  const { state, dispatch } = useEditorContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync textarea with state
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Handle focus if needed
    if (state.editorHasFocus && textarea !== document.activeElement) {
      textarea.focus();
    }

    // if text is different from the current value, update it
    if (textarea.value !== state.text) {
      textarea.value = state.text;
      textarea.setSelectionRange(
        state.selectionStart,
        state.selectionEnd,
        state.selectionDirection,
      );
    } else if (
      // if range is different from the current selection, update it
      textarea.selectionStart !== state.selectionStart ||
      textarea.selectionEnd !== state.selectionEnd ||
      textarea.selectionDirection !== state.selectionDirection
    ) {
      // Update selection range if needed
      textarea.setSelectionRange(
        state.selectionStart,
        state.selectionEnd,
        state.selectionDirection,
      );
    }
  }, [
    state.text,
    state.selectionStart,
    state.selectionEnd,
    state.selectionDirection,
    state.editorHasFocus,
  ]);

  // Handle text changes
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart, selectionEnd, selectionDirection } =
      event.target;

    // Dispatch the text and selection change
    dispatch({
      type: "SET_TEXT_AND_SELECTION",
      payload: {
        text: value,
        selectionStart,
        selectionEnd,
        selectionDirection: selectionDirection as SelectionDirection,
      },
    });
  };

  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Dispatch a key down event for plugins to handle
    dispatch({
      type: "KEY_DOWN",
      payload: {
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        nativeEvent: e.nativeEvent,
      },
    });
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Dispatch a paste event for plugins to handle
    dispatch({
      type: "PASTE",
      payload: {
        clipboardData: e.clipboardData,
        nativeEvent: e.nativeEvent,
      },
    });
  };

  // Create the selection handler function
  const handleTextSelection = (
    event: React.SyntheticEvent<HTMLTextAreaElement>,
  ) => {
    const { selectionStart, selectionEnd, selectionDirection } =
      event.target as HTMLTextAreaElement;

    // Dispatch the selection change
    if (
      selectionStart !== state.selectionStart ||
      selectionEnd !== state.selectionEnd ||
      selectionDirection !== state.selectionDirection
    ) {
      dispatch({
        type: "SET_SELECTION",
        payload: { selectionStart, selectionEnd, selectionDirection },
      });
    }
  };

  return (
    <div
      className={`editor-container ${className}`}
      data-testid="editor-container"
    >
      <textarea
        ref={textareaRef}
        value={state.text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleTextSelection}
        onFocus={() => dispatch({ type: "SET_FOCUS", payload: true })}
        onBlur={() => dispatch({ type: "SET_FOCUS", payload: false })}
        onPaste={handlePaste}
        className="editor-textarea"
        placeholder={placeholder}
        data-testid="editor-textarea"
      />
    </div>
  );
};

export default Editable;
