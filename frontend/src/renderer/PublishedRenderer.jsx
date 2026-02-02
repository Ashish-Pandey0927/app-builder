// src/renderer/PublishedRenderer.jsx
import React from "react";
import { themes } from "../themes/themes";

export default function PublishedRenderer({ schema, screenId, onNavigate }) {
  const screen = schema.screens.find((s) => s.id === screenId);
  if (!screen) return <p>Screen not found</p>;

  // Theme merge (same logic as AppRenderer)
  const defaultTheme = themes.minimal;
  const theme = {
    ...defaultTheme,
    ...(schema.theme || {}),
    colors: {
      ...defaultTheme.colors,
      ...(schema.theme?.colors || {}),
    },
  };

  function normalizeStyle(style = {}) {
  const px = (v) => (typeof v === "number" ? `${v}px` : v);

  const normalized = {};

  const keys = [
    "margin",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "borderRadius",
    "fontSize",
    "width",
    "height",
  ];

  keys.forEach((key) => {
    if (style[key] !== undefined) {
      normalized[key] = px(style[key]);
    }
  });

  return {
    ...style,
    ...normalized,
  };
}


  function renderComponent(component) {
    const { id, type, props = {}, style = {}, children = [] } = component;

    switch (type) {
      case "Text":
        return (
          <p
            key={id}
            style={{
              margin: `${theme.spacing}px 0`,
              color: theme.colors.text,
              fontFamily: theme.font,
              ...normalizeStyle(style),
            }}
          >
            {props.text}
          </p>
        );

      case "Button":
        return (
          <button
            key={id}
            style={{
              background: theme.colors.primary,
              color: "#fff",
              border: "none",
              padding: `${theme.spacing}px ${theme.spacing * 2}px`,
              borderRadius: theme.radius,
              cursor: "pointer",
              fontFamily: theme.font,
              ...normalizeStyle(style),
            }}
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
              borderRadius: theme.radius,
              objectFit: "cover",
              display: "block",
              background: '#222',
              ...normalizeStyle(style),
            }}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x150?text=Image+Not+Found"; 
            }}
          />
        );

      case "List":
        return (
          <ul
            key={id}
            style={{
              color: theme.colors.text,
              fontFamily: theme.font,
              paddingLeft: theme.spacing * 2,
              ...normalizeStyle(style),
            }}
          >
            {props.items?.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        );

      case "Spacer":
        return (
          <div
            key={id}
            aria-hidden
            style={{
              height: `${props.size || theme.spacing}px`,
              minHeight: `${props.size || theme.spacing}px`,
              width: "100%",
              flexShrink: 0,
            }}
          />
        );

      case "Container":
        return (
          <div
            key={id}
            style={{
              padding: theme.spacing,
              margin: `${theme.spacing}px 0`,
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius,
              boxSizing: "border-box",
              ...normalizeStyle(style),
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
      width: 100 + "%",
      height: 100 + "%",
      // height: "100vh",
      background: screen.style?.backgroundColor || theme.colors.background,
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        width: "100%",
        // maxWidth: 420,     // phone width limit
        height: "100%",
        background: theme.colors.background,
        fontFamily: theme.font,
        color: theme.colors.text,
        padding: theme.spacing * 2,
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <h2 style={{ marginBottom: theme.spacing * 2 }}>{screen.name}</h2>
      {screen.components.map(renderComponent)}
    </div>
  </div>
);


}
