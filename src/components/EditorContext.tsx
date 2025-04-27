/**
 * EditorContext provides the central state management and event distribution system
 * for the editor.
 *
 * The context allows plugins to register for specific events (like keyDown and paste)
 * and receive these events when they happen in the editor.
 *
 * Event flow:
 * 1. User interacts with the Editable component
 * 2. Editable dispatches events to the EditorContext
 * 3. EditorContext distributes these events to registered plugins
 * 4. Plugins can handle the events and update the editor state
 */

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useRef,
  useCallback,
} from "react";

// History constants
const HISTORY_LIMIT = 1000;
const HISTORY_TIME_GAP = 200;

// Enable debug logging
const DEBUG = true;
const log = (...args: unknown[]): void => DEBUG && console.log(...args);

export enum SelectionDirection {
  FORWARD = "forward",
  BACKWARD = "backward",
  NONE = "none",
}

// Event types for plugins
export type KeyDownEvent = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  nativeEvent: KeyboardEvent;
};

export type PasteEvent = {
  clipboardData: DataTransfer;
  nativeEvent: ClipboardEvent;
};

export type PluginEventHandler<T> = (
  event: T,
  state: EditorState,
  dispatch: EditorDispatch,
) => boolean;

export interface PluginHandlers {
  keyDown?: PluginEventHandler<KeyDownEvent>;
  paste?: PluginEventHandler<PasteEvent>;
}

// Editor state interfaces
export interface EditorHistoryRecord {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: SelectionDirection;
  timestamp: number;
}

export interface EditorState {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: SelectionDirection;
  editorHasFocus: boolean;
  plugins?: Record<string, unknown>;
  history?: {
    stack: Array<EditorHistoryRecord>;
    offset: number;
  };
}

// Define specific action types for type safety
export interface SetTextAction {
  type: "SET_TEXT";
  payload: {
    text: string;
  };
}

export interface SetSelectionAction {
  type: "SET_SELECTION";
  payload: {
    selectionStart: number;
    selectionEnd: number;
    selectionDirection?: SelectionDirection;
  };
}

export interface SetFocusAction {
  type: "SET_FOCUS";
  payload: boolean;
}

export interface AddPrefixPostfixAction {
  type: "ADD_PREFIX_POSTFIX";
  payload: {
    prefix: string;
    postfix: string;
  };
}

export interface UndoAction {
  type: "UNDO";
}

export interface RedoAction {
  type: "REDO";
}

export interface SetTextAndSelectionAction {
  type: "SET_TEXT_AND_SELECTION";
  payload: {
    text: string;
    selectionStart: number;
    selectionEnd: number;
    selectionDirection?: SelectionDirection;
  };
}

export interface ReplaceSelectionAction {
  type: "REPLACE_SELECTION";
  payload: {
    text: string;
    selected?: boolean;
  };
}

export interface KeyDownAction {
  type: "KEY_DOWN";
  payload: KeyDownEvent;
}

export interface PasteAction {
  type: "PASTE";
  payload: PasteEvent;
}

// Union type for all possible editor actions
export type EditorAction =
  | SetTextAction
  | SetSelectionAction
  | SetFocusAction
  | AddPrefixPostfixAction
  | UndoAction
  | RedoAction
  | SetTextAndSelectionAction
  | ReplaceSelectionAction
  | KeyDownAction
  | PasteAction
  | { type: string; payload?: unknown };

export type EditorDispatch = (action: EditorAction) => void;

// Helper function to record a change in history
function recordChange(
  state: EditorState,
  changes: Partial<EditorState>,
): EditorState {
  if (!state.history) {
    return {
      ...state,
      ...changes,
    };
  }

  const { stack, offset } = state.history;

  // Create record of the changes
  const record: EditorHistoryRecord = {
    text: changes.text ?? state.text,
    selectionStart: changes.selectionStart ?? state.selectionStart,
    selectionEnd: changes.selectionEnd ?? state.selectionEnd,
    selectionDirection: changes.selectionDirection ?? state.selectionDirection,
    timestamp: Date.now(),
  };

  let newStack = [...stack];
  let newOffset = offset;

  // When something updates after an undo, drop the redo operations
  if (stack.length && offset > -1 && offset < stack.length - 1) {
    newStack = stack.slice(0, offset + 1);
    newOffset = offset;
  }

  // Limit the history length
  const count = newStack.length;
  if (count > HISTORY_LIMIT) {
    const extras = count - HISTORY_LIMIT;
    newStack = newStack.slice(extras);
    newOffset = Math.max(offset - extras, 0);
  }

  const last = newStack[newOffset];

  // Group changes that happen in quick succession
  if (last && record.timestamp - last.timestamp < HISTORY_TIME_GAP) {
    newStack[newOffset] = { ...record, timestamp: last.timestamp };
  } else {
    newStack.push(record);
    newOffset++;
  }

  return {
    ...state,
    ...changes,
    history: {
      stack: newStack,
      offset: newOffset,
    },
  };
}

// Editor reducer function
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  log(`[editorReducer] Action: ${action.type}`, action);

  // First check if any plugins want to handle this action
  if (state.plugins) {
    for (const pluginId in state.plugins) {
      const plugin = state.plugins[pluginId];
      if (plugin && typeof plugin === "object" && "reducer" in plugin) {
        const pluginReducer = plugin.reducer as (
          state: EditorState,
          action: EditorAction,
        ) => EditorState | null;
        const result = pluginReducer(state, action);
        if (result !== null) {
          return result;
        }
      }
    }
  }

  // Handle the action based on its type
  switch (action.type) {
    case "SET_FOCUS": {
      const editorHasFocus = (action as SetFocusAction).payload;
      return {
        ...state,
        editorHasFocus,
      };
    }

    case "ADD_PREFIX_POSTFIX": {
      const { prefix, postfix } = (action as AddPrefixPostfixAction).payload;
      const { selectionStart, selectionEnd, text } = state;

      const textBefore = text.slice(0, selectionStart);
      const selectedText = text.slice(selectionStart, selectionEnd);
      const textAfter = text.slice(selectionEnd);

      const updatedText =
        textBefore + prefix + selectedText + postfix + textAfter;

      // Update the selection to maintain the original text
      const newSelectionStart = selectionStart + prefix.length;
      const newSelectionEnd = newSelectionStart + selectedText.length;

      // Prevent duplicate history entries
      if (
        state.text === updatedText &&
        state.selectionStart === newSelectionStart &&
        state.selectionEnd === newSelectionEnd
      ) {
        return state;
      }

      return recordChange(state, {
        text: updatedText,
        selectionStart: newSelectionStart,
        selectionEnd: newSelectionEnd,
      });
    }

    case "UNDO": {
      if (!state.history) return state;

      const { stack, offset } = state.history;
      if (offset <= 0) {
        return state;
      }

      // Get the previous record
      const prevRecord = stack[offset - 1];
      log(`[editorReducer] UNDO: Going to stack index ${offset - 1}`);

      return {
        ...state,
        text: prevRecord.text,
        selectionStart: prevRecord.selectionStart,
        selectionEnd: prevRecord.selectionEnd,
        selectionDirection: prevRecord.selectionDirection,
        history: {
          ...state.history,
          offset: offset - 1,
        },
      };
    }

    case "REDO": {
      if (!state.history) return state;

      const { stack, offset } = state.history;
      if (offset >= stack.length - 1) {
        return state;
      }

      // Get the next record
      const nextRecord = stack[offset + 1];

      return {
        ...state,
        text: nextRecord.text,
        selectionStart: nextRecord.selectionStart,
        selectionEnd: nextRecord.selectionEnd,
        selectionDirection: nextRecord.selectionDirection,
        history: {
          ...state.history,
          offset: offset + 1,
        },
      };
    }

    case "SET_SELECTION": {
      const { selectionStart, selectionEnd, selectionDirection } = (
        action as SetSelectionAction
      ).payload;

      // Prevent duplicate history entries
      if (
        state.selectionStart === selectionStart &&
        state.selectionEnd === selectionEnd &&
        state.selectionDirection === selectionDirection
      ) {
        return state;
      }

      return recordChange(state, {
        selectionStart,
        selectionEnd,
        selectionDirection: selectionDirection || SelectionDirection.NONE,
      });
    }

    case "SET_TEXT": {
      const { text } = (action as SetTextAction).payload;

      // Prevent duplicate history entries
      if (state.text === text) {
        return state;
      }

      return recordChange(state, {
        text,
      });
    }

    case "SET_TEXT_AND_SELECTION": {
      const { text, selectionStart, selectionEnd, selectionDirection } = (
        action as SetTextAndSelectionAction
      ).payload;

      // Prevent duplicate history entries
      if (
        state.text === text &&
        state.selectionStart === selectionStart &&
        state.selectionEnd === selectionEnd &&
        state.selectionDirection === selectionDirection
      ) {
        return state;
      }

      return recordChange(state, {
        text,
        selectionStart,
        selectionEnd,
        selectionDirection: selectionDirection || SelectionDirection.NONE,
      });
    }

    case "REPLACE_SELECTION": {
      const { text: newText, selected } = (action as ReplaceSelectionAction)
        .payload;
      const { selectionStart, selectionEnd, text } = state;

      const textBefore = text.slice(0, selectionStart);
      const textAfter = text.slice(selectionEnd);
      const updatedText = textBefore + newText + textAfter;

      // Prevent duplicate history entries
      if (
        state.text === updatedText &&
        state.selectionStart === selectionStart &&
        state.selectionEnd === selectionEnd
      ) {
        return state;
      }

      return recordChange(state, {
        text: updatedText,
        selectionStart: selected
          ? selectionStart
          : selectionStart + newText.length,
        selectionEnd: selectionStart + newText.length,
      });
    }

    // We don't modify state for these events, they are handled by the event system
    case "KEY_DOWN":
    case "PASTE":
      return state;

    default:
      log(`[editorReducer] Unknown action: ${action.type}`);
      return state;
  }
}

// Create the context with initial values
interface EditorContextType {
  state: EditorState;
  dispatch: EditorDispatch;
  registerPlugin: (id: string, handlers: PluginHandlers) => () => void;
}

export const EditorContext = createContext<EditorContextType | undefined>(
  undefined,
);

// Context consumer hook
export function useEditorContext(): EditorContextType {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorComposer");
  }
  return context;
}

// EditorComposer props
interface EditorComposerProps {
  initialValue?: string;
  children: ReactNode;
}

// Component that provides the context
export function EditorComposer({
  initialValue = "",
  children,
}: EditorComposerProps) {
  // Initialize editor state with history
  const initialState: EditorState = {
    text: initialValue,
    selectionStart: 0,
    selectionEnd: 0,
    selectionDirection: SelectionDirection.NONE,
    editorHasFocus: false,
    history: {
      stack: [
        {
          text: initialValue,
          selectionStart: 0,
          selectionEnd: 0,
          selectionDirection: SelectionDirection.NONE,
          timestamp: Date.now(),
        },
      ],
      offset: 0,
    },
    plugins: {},
  };

  const [state, dispatch] = useReducer(editorReducer, initialState);
  const pluginsRef = useRef<Map<string, PluginHandlers>>(new Map());

  // Handle registering plugins
  const registerPlugin = useCallback((id: string, handlers: PluginHandlers) => {
    log(`Registering plugin: ${id}`);
    pluginsRef.current.set(id, handlers);

    // Return function to unregister
    return () => {
      log(`Unregistering plugin: ${id}`);
      pluginsRef.current.delete(id);
    };
  }, []);

  // Distribute events to plugins
  const enhancedDispatch = useCallback(
    (action: EditorAction) => {
      // First dispatch the action to update state
      dispatch(action);

      // Then distribute specific events to plugins
      if (action.type === "KEY_DOWN") {
        const keyDownEvent = (action as KeyDownAction).payload;

        // Distribute to all plugins with keyDown handlers
        for (const [id, handlers] of pluginsRef.current.entries()) {
          if (handlers.keyDown) {
            const handled = handlers.keyDown(keyDownEvent, state, dispatch);
            if (handled) {
              log(`KeyDown event handled by plugin: ${id}`);
              break; // Stop propagation if handled
            }
          }
        }
      } else if (action.type === "PASTE") {
        const pasteEvent = (action as PasteAction).payload;

        // Distribute to all plugins with paste handlers
        for (const [id, handlers] of pluginsRef.current.entries()) {
          if (handlers.paste) {
            const handled = handlers.paste(pasteEvent, state, dispatch);
            if (handled) {
              log(`Paste event handled by plugin: ${id}`);
              break; // Stop propagation if handled
            }
          }
        }
      }
    },
    [state],
  );

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch: enhancedDispatch,
        registerPlugin,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
