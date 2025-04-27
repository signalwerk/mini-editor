import React, { useEffect } from "react";
import { useEditorContext } from "../../EditorContext";

interface OnChangePluginProps {
  onChange: (value: string) => void;
}

const OnChangePlugin: React.FC<OnChangePluginProps> = ({ onChange }) => {
  const { state } = useEditorContext();

  useEffect(() => {
    onChange(state.text);
  }, [state.text, onChange]);

  // This is a functional component that just subscribes to changes
  // It doesn't render anything
  return null;
};

export default OnChangePlugin;
