import React from "react";
import "../style/HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Enter your idea",
    description:
      "Describe your app in simple terms. The more details you give, the smarter the output becomes.",
    gif: "/gif/step1.gif",
  },
  {
    number: "02",
    title: "AI generates your app",
    description:
      "Our AI instantly creates a structured mobile UI with real screens and components.",
    gif: "/gif/step2.gif",
  },
  {
    number: "03",
    title: "Edit visually",
    description:
      "Customize layout, spacing, themes and components using our visual editor.",
    gif: "/gif/step3.gif",
  },
  {
    number: "04",
    title: "Export & launch",
    description:
      "Export production-ready HTML or PWA and deploy your app instantly.",
    gif: "/gifs/step4.gif",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-wrapper">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`how-section ${
            index % 2 !== 0 ? "reverse" : ""
          }`}
        >
          <div className="how-text">
            <span className="step-number">{step.number}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </div>

          <div className="how-media">
            <img src={step.gif} alt={step.title} />
          </div>
        </div>
      ))}
    </section>
  );
}