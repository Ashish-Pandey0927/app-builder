import { useState, useEffect } from "react";

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

  const [draggedId, setDraggedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const GRID_SIZE = 20;
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [snapStrength, setSnapStrength] = useState(1); // 0 = loose, 1 = strict

  const isBuilder = mode === "builder";
  const isPreview = mode === "preview";
  const isPublish = mode === "publish";

  useEffect(() => {
    function handleWheel(e) {
      if (!e.ctrlKey) return;

      e.preventDefault();
      setZoom((z) => {
        const next = z - e.deltaY * 0.001;
        return Math.min(2, Math.max(0.4, next));
      });
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  function renderComponent(component, parentId = null) {
    const { id, type, props = {}, style={} } = component;
    const isSelected = id === selectedComponentId;
    const isDraggable = type !== "Container";

    const wrapperStyle = {
      position: "relative",
      padding: 6,
      margin: "6px 0",
      cursor: isBuilder ? "pointer" : "default",
      border: isSelected
        ? "2px solid #6200ee"
        : hoveredId === id && isBuilder
        ? "1px dashed #7c4dff"
        : "1px solid rgba(0,0,0,0.15)",
      borderRadius: 4,
      background: isSelected
        ? "rgba(98,0,238,0.05)"
        : hoveredId === id
        ? "rgba(124,77,255,0.04)"
        : "transparent",
      boxShadow: isSelected
        ? "0 0 0 2px rgba(41,98,255,0.25)"
        : hoveredId === id
        ? "0 0 0 1px rgba(156,39,176,0.2)"
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
        content = <p style={{ margin: 0, ...style }}>{props.text}</p>;
        break;
      case "Button":
        content = (
          <button 
            style={style}
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
        content = <img src={props.src} alt="" style={{ width: "100%", ...style }} />;
        break;
      case "List":
        content = (
          <ul style={style}>
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
              border: "1px dashed #aaa",
              padding: 10,
              background: "rgba(98,0,238,0.03)",
              minHeight: 40,
              ...style
            }}
            onDragOver={(e) => {
              const data = e.dataTransfer.getData("draggedComponent");
              if (!data) return;

              const parsed = JSON.parse(data);
              if (parsed.fromContainerId === id) return; // let wrapper handle reorder

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
            <p style={{ fontSize: 12, color: "#666" }}>Container</p>
            {component.children?.length ? (
              component.children.map((c) => renderComponent(c, id))
            ) : (
              <p style={{ fontSize: 11, color: "#999" }}>Drop here</p>
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
        {isSelected && isBuilder && (
          <div
            style={{
              position: "absolute",
              top: -18,
              left: 0,
              background: "#6200ee",
              color: "#fff",
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              pointerEvents: "none",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {type}
          </div>
        )}
        {hoveredId === id && isBuilder && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              background: "#6200ee",
              top: hoverPosition === "before" ? 0 : "100%",
              transform: "translateY(-1px)",
            }}
          />
        )}

        {content}
      </div>
    );
  }

  // SCREEN ROOT DROP ZONE (move OUT of container)
  return (
    <div
      style={{
        position: "relative",
        padding: 20,
        minHeight: 360,
        background: "#fafafa",
        border: "1px solid #e0e0e0",
        overflowY: "hidden",
        transform: `scale(${zoom})`,
        transformOrigin: "top center",
        backgroundImage: showGrid
          ? `
      linear-gradient(to right, #eaeaea 1px, transparent 1px),
      linear-gradient(to bottom, #eaeaea 1px, transparent 1px)
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
