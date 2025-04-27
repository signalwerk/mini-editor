import { useState } from "react";
import { EditorComposer } from "../components/EditorContext";
import Editable from "../components/Editable";
import AutoLinkPlugin from "../components/plugins/AutoLinkPlugin";
import OnChangePlugin from "../components/plugins/OnChangePlugin";
import BoldPlugin from "../components/plugins/BoldPlugin";
import ItalicPlugin from "../components/plugins/ItalicPlugin";
import BracketWrapPlugin from "../components/plugins/BracketWrapPlugin";
import UndoRedoPlugin from "../components/plugins/UndoRedoPlugin";
import HistoryViewer from "../components/HistoryViewer";
import "./EditorDemo.css";

const EditorDemo = () => {
  const [editorValue, setEditorValue] = useState<string>(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
  };

  return (
    <div className="editor-dev-container">
      <h1>Editor Component Demo</h1>

      <div className="plugin-controls">
        <h2>Active Plugins</h2>
        <div className="plugin-info">
          <h3>Usage Tips:</h3>
          <ul>
            <li>
              <strong>Bold:</strong> Select text and press Ctrl/Cmd+B to make it
              bold with ** **.
            </li>
            <li>
              <strong>Italic:</strong> Select text and press Ctrl/Cmd+I to
              italicize with _ _.
            </li>
            <li>
              <strong>Bracket Wrapping:</strong> Select text and press brackets
              like [], (), {"{}"}, &quot;&quot;, etc. to wrap selected text.
            </li>
            <li>
              <strong>Auto Link:</strong> Select text and paste a URL to create
              a markdown link.
            </li>
            <li>
              <strong>History:</strong> Use Ctrl/Cmd+Z to undo and
              Ctrl/Cmd+Shift+Z (or Ctrl+Y on Windows) to redo. (Built into the
              editor)
            </li>
          </ul>
        </div>
      </div>

      <div className="editor-section">
        <h2>Editor Component</h2>
        <EditorComposer initialValue={editorValue}>
          <Editable placeholder="Enter some text..." className="dev-editor" />
          <BoldPlugin />
          <ItalicPlugin />
          <BracketWrapPlugin />
          <UndoRedoPlugin />
          <OnChangePlugin onChange={handleEditorChange} />
          <HistoryViewer />
          <AutoLinkPlugin />
        </EditorComposer>
      </div>

      <div className="output-section">
        <h2>Editor Output</h2>
        <pre className="output-preview">{editorValue || "(empty)"}</pre>
      </div>
    </div>
  );
};

export default EditorDemo;
