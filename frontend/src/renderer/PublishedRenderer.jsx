// src/renderer/PublishedRenderer.jsx
import React from "react";

export default function PublishedRenderer({ schema, screenId, onNavigate }) {
  const screen = schema.screens.find((s) => s.id === screenId);
  if (!screen) return <p>Screen not found</p>;

  function renderComponent(component) {
    const { id, type, props = {}, children = [] } = component;

    switch (type) {
      case "Text":
        return <p key={id}>{props.text}</p>;

      case "Button":
        return (
          <button
            key={id}
            onClick={() => {
              if (props.action?.type === "navigate") {
                onNavigate(props.action.targetScreenId);
              }
            }}
          >
            {props.label}
          </button>
        );

      case "Image":
        return <img key={id} src={props.src} alt="" style={{ width: "100%" }} />;

      case "List":
        return (
          <ul key={id}>
            {props.items?.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        );

      case "Spacer":
        return <div key={id} style={{ height: props.height }} />;

      case "Container":
        return (
          <div
            key={id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              margin: "8px 0",
            }}
          >
            {children.map(renderComponent)}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{screen.name}</h2>
      {screen.components.map(renderComponent)}
    </div>
  );
}
