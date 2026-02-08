import { useState } from "react";
import Hero from "./pages/Hero";
// import PromptPage from "./pages/PromptPage";
import Editor from "./pages/editorPage";
import HowItWorks from "./pages/HowItWorks";

function App() {
  const [schema, setSchema] = useState(null);

  // "landing" | "prompt" | "editor"
  if (!schema) {
    return (
      <>
        <Hero onStart={setSchema} />
        <HowItWorks />
      </>
    );
  }

  return <Editor initialSchema={schema} />;
}

export default App;
