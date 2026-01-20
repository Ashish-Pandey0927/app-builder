// src/renderer/PublishedRenderer.jsx
import React from "react";

export default function PublishedRenderer({ schema, screenId, onNavigate }) {
  const screen = schema.screens.find((s) => s.id === screenId);
  if (!screen) return <p>Screen not found</p>;

  function renderComponent(component) {
    const {
      id,
      type,
      props = {},
      style = {},
      children = [],
    } = component;

    switch (type) {
      case "Text":
        return (
          <p key={id} style={style}>
            {props.text}
          </p>
        );

      case "Button":
        return (
          <button
            key={id}
            style={style}
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
        return (
          <img
            key={id}
            src={props.src}
            alt={props.alt || ""}
            style={{
              width: "100%",
              display: "block",
              ...style,
            }}
          />
        );

      case "List":
        return (
          <ul key={id} style={style}>
            {props.items?.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        );

      case "Spacer":
        return (
          <div
            key={id}
            style={{
              height: props.height,
              ...style,
            }}
          />
        );

      case "Container":
        return (
          <div
            key={id}
            style={{
              padding: 10,
              margin: "8px 0",
              boxSizing: "border-box",
              ...style, // user styling overrides default
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
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        boxSizing: "border-box",
        background: "#ffffff",
      }}
    >
      <h2>{screen.name}</h2>
      {screen.components.map(renderComponent)}
    </div>
  );
}
