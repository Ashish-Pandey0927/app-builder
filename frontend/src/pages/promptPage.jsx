import { useState } from "react";
import { generateFromPrompt } from "./generateFromPrompt";
// import "index.css";

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
  <div style={{ position: "relative", width: "100%", height: "100vh" }}>
    <div className={`animated-bg ${loading ? "blurred" : ""}`}>
      <div className="bg-blur">
        <div className="prompt-ui">
          <div className="hero-prompt">
            <h1>AI App Builder</h1>
            <p>Describe your app. We build the UI instantly.</p>

            <div className="prompt-bar">
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

            <div className="quick-prompts">
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
            </div>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
      </div>
    </div>

    {/* 👇 THIS IS THE MAGIC */}
    {loading && <GeneratingOverlay />}
  </div>
);

}

export default PromptPage;
