import { useEditorContext } from "./EditorContext";

const HistoryViewer = () => {
  const { state } = useEditorContext();
  const history = state.history;

  if (!history) {
    return null;
  }

  // Generate history items in reverse order
  const historyItems = [];
  for (let i = history.stack.length - 1; i >= 0; i--) {
    const record = history.stack[i];
    historyItems.push(
      <div
        key={record.timestamp}
        className={`history-item ${i === history.offset ? "current" : ""}`}
      >
        <div>
          <strong>Text:</strong>{" "}
          {record.text.length > 550
            ? `${record.text.substring(0, 550)}...`
            : record.text}
        </div>
        <div>
          <strong>Selection:</strong> {record.selectionStart}-
          {record.selectionEnd} ({record.selectionDirection})
        </div>
        <div>
          <strong>Time:</strong>{" "}
          {new Date(record.timestamp).toLocaleTimeString()}
        </div>
      </div>,
    );
  }

  return (
    <div className="history-section">
      <h2>Editor History</h2>
      <div className="history-viewer">
        <div className="history-stack">
          <h3>History Stack</h3>
          <div className="history-items">{historyItems}</div>
        </div>
        <div className="history-info">
          <h3>History Info</h3>
          <div className="history-stats">
            <div className="history-stat">
              <strong>Stack Size:</strong> {history.stack.length || 0}
            </div>
            <div className="history-stat">
              <strong>Current Position:</strong> {history.offset || 0}
            </div>
            <div className="history-stat">
              <strong>Can Undo:</strong>{" "}
              {history && history.offset > 0 ? "Yes" : "No"}
            </div>
            <div className="history-stat">
              <strong>Can Redo:</strong>{" "}
              {history && history.offset < history.stack.length - 1
                ? "Yes"
                : "No"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryViewer;
