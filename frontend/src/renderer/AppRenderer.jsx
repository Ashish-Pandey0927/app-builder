import { useState } from "react";

function AppRenderer({
  schema,
  currentScreenId,
  onNavigate,
  selectedComponentId,
  onSelectComponent,
  onReorderComponent,
  onMoveIntoContainer,
}) {
  if (!schema || !Array.isArray(schema.screens)) {
    return <p>Invalid app schema</p>;
  }

  const screen = schema.screens.find((s) => s.id === currentScreenId);
  if (!screen) return <p>Screen not found</p>;

  const [draggedId, setDraggedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);

  function renderComponent(component, parentId = null) {
    const { id, type, props = {} } = component;
    const isSelected = id === selectedComponentId;
    const isDraggable = type !== "Container";

    const wrapperStyle = {
      border:
        hoveredId === id
          ? hoverPosition === "before"
            ? "2px solid #4caf50"
            : "2px solid #2196f3"
          : isSelected
          ? "2px solid #6200ee"
          : "1px dashed #ccc",
      padding: 6,
      margin: "6px 0",
      cursor: isDraggable ? "grab" : "default",
      background:
        hoveredId === id ? "#fff3e0" : isSelected ? "#ede7ff" : "transparent",
      position: "relative",
      opacity: draggedId === id ? 0.5 : 1,
    };

    function handleSelect(e) {
      e.stopPropagation();
      onSelectComponent(id);
    }

    let content = null;

    switch (type) {
      case "Text":
        content = <p>{props.text}</p>;
        break;
      case "Button":
        content = (
          <button
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
        content = <img src={props.src} alt="" style={{ width: "100%" }} />;
        break;
      case "List":
        content = (
          <ul>
            {props.items?.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        );
        break;
      case "Spacer":
        content = <div style={{ height: props.height }} />;
        break;

      case "Container":
        content = (
          <div
            style={{
              border: "1px dashed #aaa",
              padding: 10,
              background: "#f9f9f9",
              minHeight: 40,
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

              const data = JSON.parse(e.dataTransfer.getData("draggedComponent"));
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
        draggable={isDraggable}
        onDragStart={(e) => {
          if (!isDraggable) return;

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
          e.preventDefault();
          e.stopPropagation();

          const rect = e.currentTarget.getBoundingClientRect();
          const offsetY = e.clientY - rect.top;
          setHoveredId(id);
          setHoverPosition(offsetY < rect.height / 2 ? "before" : "after");
        }}
        onDrop={(e) => {
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
      >
        {content}
      </div>
    );
  }

  // SCREEN ROOT DROP ZONE (move OUT of container)
  return (
    <div
      style={{
        padding: 10,
        minHeight: 400,
        background: "#fafafa",
        border: "2px dashed #ddd",
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
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
