import { useState } from "react";
import Hero from "./pages/Hero";
import PromptPage from "./pages/PromptPage";
import Editor from "./pages/editorPage";

function App() {
  const [schema, setSchema] = useState(null);
  const [view, setView] = useState("landing"); 
  // "landing" | "prompt" | "editor"

  if (view === "landing") {
    return <Hero onStart={() => setView("prompt")} />;
  }

  if (view === "prompt") {
    return (
      <PromptPage
        onGenerate={(generatedSchema) => {
          setSchema(generatedSchema);
          setView("editor");
        }}
      />
    );
  }

  if (view === "editor") {
    return <Editor initialSchema={schema} />;
  }

  return null;
}

export default App;