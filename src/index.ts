// Export the core components
export { EditorComposer, useEditorContext } from "./components/EditorContext";
export { default as Editable } from "./components/Editable";

// Export the editor types
export type {
  EditorState,
  EditorAction,
  EditorDispatch,
  SelectionDirection,
  KeyDownEvent,
  PasteEvent,
  PluginEventHandler,
  PluginHandlers,
} from "./components/EditorContext";

// Export the history viewer
export { default as HistoryViewer } from "./components/HistoryViewer";

// Export plugins
export { default as BoldPlugin } from "./components/plugins/BoldPlugin";
export { default as ItalicPlugin } from "./components/plugins/ItalicPlugin";
export { default as BracketWrapPlugin } from "./components/plugins/BracketWrapPlugin";
export { default as UndoRedoPlugin } from "./components/plugins/UndoRedoPlugin";
export { default as AutoLinkPlugin } from "./components/plugins/AutoLinkPlugin";
export { default as OnChangePlugin } from "./components/plugins/OnChangePlugin";

// Export the demo
export { default as EditorDemo } from "./demo/EditorDemo";
