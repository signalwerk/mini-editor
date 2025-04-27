# MiniEditor

A lightweight, extensible React text editor with a plugin system.

## Features

- Markdown-style formatting (bold, italic)
- Bracket wrapping
- Auto link creation
- Undo/redo history
- Context-based plugin architecture with event distribution
- Lightweight and customizable

## Installation

```bash
npm install mini-editor
```

## Usage

The editor uses a context-based architecture where the `EditorComposer` provides a context for all editor components and plugins to communicate through. It implements an event distribution system where plugins register handlers for specific events.

### Basic Usage

```jsx
import { EditorComposer, Editable, OnChangePlugin } from 'mini-editor';

function MyEditor() {
  const handleChange = (value) => {
    console.log('Content changed:', value);
  };

  return (
    <EditorComposer initialValue="Hello world!">
      <Editable placeholder="Start typing..." />
      <OnChangePlugin onChange={handleChange} />
    </EditorComposer>
  );
}
```

### With Plugins

```jsx
import { 
  EditorComposer, 
  Editable, 
  BoldPlugin, 
  ItalicPlugin, 
  BracketWrapPlugin, 
  AutoLinkPlugin, 
  UndoRedoPlugin,
  OnChangePlugin,
  HistoryViewer
} from 'mini-editor';

function MyEditor() {
  const [value, setValue] = useState('Hello world!');

  return (
    <EditorComposer initialValue={value}>
      <Editable placeholder="Start typing..." />
      
      {/* Formatting plugins */}
      <BoldPlugin />
      <ItalicPlugin />
      <BracketWrapPlugin />
      <AutoLinkPlugin />
      <UndoRedoPlugin />
      
      {/* Event handling */}
      <OnChangePlugin onChange={setValue} />
      
      {/* Optional history viewer */}
      <HistoryViewer />
    </EditorComposer>
  );
}
```

## How It Works

MiniEditor uses a context-based event system where:

1. `EditorComposer` provides the context and maintains a registry of plugins
2. `Editable` captures user interactions and dispatches events
3. Plugins register handlers for specific events (like keyDown, paste)
4. Events are distributed to plugins in registration order

This approach is more React-friendly than having each plugin attach its own DOM event listeners.

## Available Components

### EditorComposer

The main context provider that manages editor state and event distribution.

```jsx
<EditorComposer initialValue="Initial text">
  {/* children */}
</EditorComposer>
```

### Editable

The actual editable text area.

```jsx
<Editable 
  placeholder="Start typing..." 
  className="custom-editor-class"
/>
```

### HistoryViewer

Shows the editor history stack (useful for debugging).

```jsx
<HistoryViewer />
```

## Available Plugins

### BoldPlugin

Makes selected text bold (Cmd/Ctrl+B).

```jsx
<BoldPlugin />
```

### ItalicPlugin

Makes selected text italic (Cmd/Ctrl+I).

```jsx
<ItalicPlugin />
```

### BracketWrapPlugin

Wraps selected text with brackets when a bracket key is pressed.

```jsx
<BracketWrapPlugin />
```

### AutoLinkPlugin

Converts selected text to a markdown link when a URL is pasted.

```jsx
<AutoLinkPlugin />
```

### UndoRedoPlugin

Adds undo/redo functionality (Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z).

```jsx
<UndoRedoPlugin />
```

### OnChangePlugin

Fires a callback when the editor content changes.

```jsx
<OnChangePlugin onChange={(value) => console.log(value)} />
```

## Creating Custom Plugins

You can create custom plugins by using the `useEditorContext` hook and the plugin registration system:

```jsx
import { useEffect } from 'react';
import { useEditorContext, KeyDownEvent, EditorState, EditorDispatch } from 'mini-editor';

const MyCustomPlugin = () => {
  const { state, dispatch, registerPlugin } = useEditorContext();
  
  useEffect(() => {
    // Create event handlers
    const keyDownHandler = (event: KeyDownEvent, state: EditorState, dispatch: EditorDispatch) => {
      // Handle key down events
      const { key, ctrlKey, metaKey, nativeEvent } = event;
      
      if ((ctrlKey || metaKey) && key === 'x') {
        // Do something special on Ctrl/Cmd+X
        nativeEvent.preventDefault();
        dispatch({
          type: 'SOME_ACTION',
          payload: { /* ... */ }
        });
        return true; // Return true to indicate event was handled
      }
      
      return false; // Return false to let other plugins handle the event
    };
    
    // Register the plugin with the editor context
    const unregister = registerPlugin('my-custom-plugin', {
      keyDown: keyDownHandler,
      // You can also add handlers for other events like paste
    });
    
    // Return the cleanup function
    return unregister;
  }, [state, dispatch, registerPlugin]);
  
  // Plugins don't render anything
  return null;
};

export default MyCustomPlugin;
```

## Event Types

The editor supports these event types:

- **keyDown**: Triggered when a key is pressed
- **paste**: Triggered when content is pasted

## License

MIT
