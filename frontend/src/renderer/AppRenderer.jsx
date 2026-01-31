import { useState, useEffect } from "react";
import { themes } from "../themes/themes";

function AppRenderer({
  schema,
  currentScreenId,
  onNavigate,
  selectedComponentId,
  onSelectComponent,
  onReorderComponent,
  onMoveIntoContainer,
  mode,
}) {
  if (!schema || !Array.isArray(schema.screens)) {
    return <p>Invalid app schema</p>;
  }

  const screen = schema.screens.find((s) => s.id === currentScreenId);
  if (!screen) return <p>Screen not found</p>;

  // Theme merge (safe + fallback)
  const defaultTheme = themes.minimal;
  const theme = {
    ...defaultTheme,
    ...(schema.theme || {}),
    colors: {
      ...defaultTheme.colors,
      ...(schema.theme?.colors || {}),
    },
  };

  const [draggedId, setDraggedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);

  const GRID_SIZE = 20;
  const [showGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [snapStrength] = useState(1);

  const isBuilder = mode === "builder";

  useEffect(() => {
    function handleWheel(e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((z) => Math.min(2, Math.max(0.4, z - e.deltaY * 0.001)));
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  function renderComponent(component, parentId = null) {
    const { id, type, props = {}, style = {} } = component;
    const isSelected = id === selectedComponentId;
    const isDraggable = type !== "Container";

    const wrapperStyle = {
      position: "relative",
      padding: 6,
      margin: "6px 0",
      cursor: isBuilder ? "pointer" : "default",
      border: isSelected
        ? `2px solid ${theme.colors.primary}`
        : hoveredId === id && isBuilder
        ? `1px dashed ${theme.colors.primary}`
        : `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius,
      background: isSelected
        ? theme.colors.hover
        : hoveredId === id
        ? theme.colors.surface
        : "transparent",
      boxShadow: isSelected
        ? `0 0 0 2px ${theme.colors.primary}55`
        : "none",
      transition: "all 0.12s ease",
    };

    function handleSelect(e) {
      if (!isBuilder) return;
      e.stopPropagation();
      onSelectComponent(id);
    }

    let content = null;

    switch (type) {
      case "Text":
        content = (
          <p
            style={{
              margin: 0,
              color: theme.colors.text,
              fontFamily: theme.font,
              ...style,
            }}
          >
            {props.text}
          </p>
        );
        break;

      case "Button":
        content = (
          <button
            style={{
              background: theme.colors.primary,
              color: "#fff",
              border: "none",
              padding: `${theme.spacing}px ${theme.spacing * 2}px`,
              borderRadius: theme.radius,
              cursor: "pointer",
              ...style,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (props.action?.type === "navigate") {
                onNavigate(props.action.targetScreenId);
              }
            }}
          >
            {props.label}
          </button>
        );
        break;

      case "Image":
        content = (
          <img
            src={props.src}
            alt=""
            style={{ width: "100%", borderRadius: theme.radius, ...style }}
          />
        );
        break;

      case "List":
        content = (
          <ul style={{ color: theme.colors.text, ...style }}>
            {props.items?.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        );
        break;

      case "Spacer":
        content = <div style={{ height: props.height, ...style }} />;
        break;

      case "Container":
        content = (
          <div
            style={{
              border: `1px dashed ${theme.colors.border}`,
              padding: theme.spacing,
              background: theme.colors.surface,
              borderRadius: theme.radius,
              minHeight: 40,
              ...style,
            }}
            onDragOver={(e) => {
              const data = e.dataTransfer.getData("draggedComponent");
              if (!data) return;
              const parsed = JSON.parse(data);
              if (parsed.fromContainerId === id) return;
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const data = JSON.parse(
                e.dataTransfer.getData("draggedComponent")
              );
              if (data.fromContainerId === id) return;
              onMoveIntoContainer(data.id, id);
            }}
          >
            {component.children?.length
              ? component.children.map((c) => renderComponent(c, id))
              : (
                <p style={{ fontSize: 11, color: theme.colors.text, opacity: 0.5 }}>
                  Drop here
                </p>
              )}
          </div>
        );
        break;

      default:
        return null;
    }

    return (
      <div
        key={id}
        style={wrapperStyle}
        onClick={handleSelect}
        draggable={isBuilder && isDraggable}
        onDragStart={(e) => {
          if (!isBuilder || !isDraggable) return;
          setDraggedId(id);
          e.dataTransfer.setData(
            "draggedComponent",
            JSON.stringify({ id, fromContainerId: parentId })
          );
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedId(null);
          setHoveredId(null);
        }}
        onDragOver={(e) => {
          if (!isBuilder) return;
          e.preventDefault();
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetY = e.clientY - rect.top;
          const raw = offsetY;
          const snapped = Math.round(raw / GRID_SIZE) * GRID_SIZE;
          const snappedY = raw + (snapped - raw) * snapStrength;
          setHoveredId(id);
          setHoverPosition(snappedY < rect.height / 2 ? "before" : "after");
        }}
        onDrop={(e) => {
          if (!isBuilder) return;
          e.preventDefault();
          e.stopPropagation();
          const data = JSON.parse(e.dataTransfer.getData("draggedComponent"));
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetY = e.clientY - rect.top;
          const position = offsetY < rect.height / 2 ? "before" : "after";
          if (parentId === data.fromContainerId && data.id !== id) {
            onReorderComponent(data.id, id, position);
          }
        }}
        onMouseEnter={() => isBuilder && setHoveredId(id)}
        onMouseLeave={() => isBuilder && setHoveredId(null)}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        padding: theme.spacing * 2,
        minHeight: 360,
        background: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        fontFamily: theme.font,
        color: theme.colors.text,
        overflow: "hidden",
        transform: `scale(${zoom})`,
        transformOrigin: "top center",
        backgroundImage: showGrid
          ? `
            linear-gradient(to right, ${theme.colors.border} 1px, transparent 1px),
            linear-gradient(to bottom, ${theme.colors.border} 1px, transparent 1px)
          `
          : "none",
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
      onDragOver={(e) => {
        if (!isBuilder) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (!isBuilder) return;
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("draggedComponent"));
        onMoveIntoContainer(data.id, null);
      }}
    >
      <h2>{screen.name}</h2>
      {screen.components.map((c) => renderComponent(c, null))}
    </div>
  );
}

export default AppRenderer;
