import { useState } from "react";
import { generateFromPrompt } from "./generateFromPrompt";

function GeneratingOverlay() {
  return (
    <div className="generating-overlay">
      <div className="generating-card">
        <div className="spinner" />
        <h3>Generating your app</h3>
        <p>Designing screens, layout & components…</p>
      </div>
    </div>
  );
}

export default function HeroPrompt({ onGenerate }) {
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
      setError("Failed to generate app.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero-prompt">
      <div className={`prompt-bar ${loading ? "disabled" : ""}`}>
        <textarea
          placeholder="Describe your app idea..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {/* <div className="quick-prompts">
        {[
          "To-do app with tasks and categories",
          "Fitness app with workouts and profile",
          "Notes app with folders",
        ].map((text, i) => (
          <button
            key={i}
            onClick={() => setPrompt(text)}
            disabled={loading}
            className="quick-prompt-btn"
          >
            {text}
          </button>
        ))}
      </div> */}

      {error && <p className="error">{error}</p>}
      {loading && <GeneratingOverlay />}
    </div>
  );
}