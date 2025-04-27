import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import EditorDemo from "./demo/EditorDemo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EditorDemo />
  </StrictMode>,
);
