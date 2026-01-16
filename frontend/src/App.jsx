import { useState } from "react";
import PromptPage from "./pages/promptPage";
import Editor from "./pages/editorPage";

function App() {
  const [schema, setSchema] = useState(null);

  if (!schema) {
    return <PromptPage onGenerate={setSchema} />;
  }

  return <Editor initialSchema={schema} />;
}

export default App;
