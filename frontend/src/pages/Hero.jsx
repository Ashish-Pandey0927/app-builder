import { useEffect } from "react";
import "../style/hero.css";
import FakeEditorPreview from "./FakeEditorPreview";

export default function Hero({ onStart }) {
  useEffect(() => {
    const container = document.querySelector(".shooting-stars");
    if (!container) return;

    function createShootingStar() {
      const star = document.createElement("div");
      star.className = "shooting-star";

      // Start off-screen (top-right area)
      star.style.top = Math.random() * window.innerHeight * 0.4 + "px";
      star.style.left = window.innerWidth + Math.random() * 200 + "px";

      container.appendChild(star);

      // Cleanup
      setTimeout(() => {
        star.remove();
      }, 1500);
    }

    const interval = setInterval(() => {
      // Not spammy, feels natural
      if (Math.random() > 0.65) {
        createShootingStar();
      }
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="stars stars-back"></div>
      <div className="stars stars-mid"></div>
      <div className="stars stars-front"></div>
      <div className="shooting-stars"></div>

      <div className="hero-left">
        <h1>
          Build real mobile apps <span>visually</span>
        </h1>

        <p className="hero-sub">
          Describe an app. Edit it visually. Export it instantly.
          <br />
          No code. No hassle.
        </p>

        <div className="hero-cta">
          <button className="primary" onClick={onStart}>
            Try the Editor
          </button>
          <button className="secondary">Demo Video</button>
        </div>
        <p className="hero-cta-note">No sign-up required. Free beta</p>
      </div>

      <div className="hero-right">
        <FakeEditorPreview />
      </div>
    </section>
  );
}