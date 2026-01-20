import React, { useState } from "react";

function ComponentTree({ components, selectedId, onSelect }) {
  const [collapsed, setCollapsed] = useState({});
  const [hovered, setHovered] = useState(null);

  const icons = {
    Text: "📝",
    Button: "🔘",
    Image: "🖼️",
    List: "📋",
    Spacer: "↕️",
    Container: "📦",
  };

  function toggle(id) {
    setCollapsed((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function renderNode(component, level = 0) {
    const isSelected = component.id === selectedId;
    const isCollapsed = collapsed[component.id];

    return (
      <div key={component.id}>
        <div
          onClick={() => onSelect(component.id)}
          onMouseEnter={() => setHovered(component.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: "6px 8px",
            marginLeft: level * 14,
            cursor: "pointer",
            borderRadius: 4,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background:
              isSelected ? "#6200ee" : hovered === component.id ? "#2a2a2a" : "transparent",
            color: isSelected ? "#fff" : "#bbb",
            transition: "0.15s",
          }}
        >
          {/* Expand / Collapse Arrow */}
          {component.type === "Container" ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggle(component.id);
              }}
              style={{
                cursor: "pointer",
                width: 12,
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              {isCollapsed ? "▶" : "▼"}
            </span>
          ) : (
            <span style={{ width: 12 }} />
          )}

          {/* Icon */}
          <span>{icons[component.type]}</span>

          {/* Label */}
          <span>{component.type}</span>
        </div>

        {/* Children */}
        {component.type === "Container" &&
          !isCollapsed &&
          component.children?.map((child) => renderNode(child, level + 1))}
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: 12,
        padding: 4,
        userSelect: "none",
      }}
    >
      {components.map((c) => renderNode(c))}
    </div>
  );
}

export default ComponentTree;
