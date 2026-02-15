import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Hero from "./pages/Hero";
import HowItWorks from "./pages/HowItWorks";
import Editor from "./pages/editorPage";
import MobilePreview from "./pages/MobilePreview";

function Landing({ onStart }) {
  useEffect(() => {
    const container = document.querySelector(".shooting-stars");
    if (!container) return;

    function createShootingStar() {
      const star = document.createElement("div");
      star.className = "shooting-star";
      star.style.top = Math.random() * window.innerHeight * 0.4 + "px";
      star.style.left = window.innerWidth + Math.random() * 200 + "px";
      container.appendChild(star);
      setTimeout(() => star.remove(), 1500);
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.65) createShootingStar();
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="stars stars-small"></div>
      <div className="stars stars-medium"></div>
      <div className="stars stars-big"></div>
      <div className="shooting-stars"></div>

      <Hero onStart={onStart} />
      <HowItWorks />
    </div>
  );
}

function App() {
  const [schema, setSchema] = useState(
    JSON.parse(localStorage.getItem("app_schema"))
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing onStart={setSchema} />} />
        <Route
          path="/editor"
          element={schema ? <Editor initialSchema={schema} /> : <Landing onStart={setSchema} />}
        />
        <Route path="/preview" element={<MobilePreview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;