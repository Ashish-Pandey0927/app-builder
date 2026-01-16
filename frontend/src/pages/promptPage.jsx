import { useState } from "react";
import { generateFromPrompt } from "./generateFromPrompt";

function PromptPage({ onGenerate }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Write something first.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const schema = await generateFromPrompt(prompt);
      onGenerate(schema);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate app.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f0f0f",
        color: "#fff",
        padding: 20,
      }}
    >
      <h1 style={{ marginBottom: 8 }}>AI App Builder</h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Describe your app. We generate the UI.
      </p>

      <textarea
        placeholder="Build a To-Do app with a home screen and task list..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{
          width: 400,
          height: 120,
          padding: 10,
          borderRadius: 6,
          resize: "none",
          border: "none",
          outline: "none",
        }}
      />

      {error && <p style={{ color: "#ff4d4d" }}>{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          marginTop: 15,
          padding: "10px 20px",
          background: "#6200ee",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Generating..." : "Generate App"}
      </button>

      <div style={{ marginTop: 30, opacity: 0.6 }}>
        Examples:
        <ul>
          <li>“To-do app with task list and add button”</li>
          <li>“Fitness app with profile and workout screens”</li>
          <li>“Notes app with categories”</li>
        </ul>
      </div>
    </div>
  );
}

export default PromptPage;
