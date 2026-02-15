// import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../style/hero.css";
import FakeEditorPreview from "./FakeEditorPreview";
import HeroPrompt from "./HeroPrompt";

export default function Hero({ onStart }) {
  const navigate = useNavigate();

  function handleGenerate(schema) {
    onStart(schema);
    navigate("/editor");
  }
  
  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Build real mobile apps <span>visually</span>
        </h1>

        <p className="hero-sub">
          Describe an app. Edit it visually. Export it instantly.
          <br />
          No code. No hassle.
        </p>

        <HeroPrompt onGenerate={handleGenerate} />
        <p className="hero-cta-note">No sign-up required. Free beta</p>
      </div>

      <div className="hero-right">
        <FakeEditorPreview />
      </div>
    </section>
  );
}