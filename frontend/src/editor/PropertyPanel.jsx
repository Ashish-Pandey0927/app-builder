import { useEffect, useRef } from "react";

function PropertyPanel({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveComponent,
  componentIndex,
  totalComponents,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedComponent]);

  if (!selectedComponent) {
    return (
      <div style={{ color: "#777", fontSize: 13, padding: 12 }}>
        Select a component to edit its properties.
      </div>
    );
  }

  const { id, type, props } = selectedComponent;

  function updateProp(key, value) {
    onUpdateComponent({
      ...selectedComponent,
      props: {
        ...props,
        [key]: value,
      },
    });
  }

  const sectionStyle = {
    background: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  };

  const labelStyle = {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 4,
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 8px",
    background: "#2a2a2a",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 4,
    fontSize: 12,
  };

  function renderFields() {
    switch (type) {
      case "Text":
        return (
          <>
            <div style={labelStyle}>Text</div>
            <input
              style={inputStyle}
              value={props.text || ""}
              onChange={(e) => updateProp("text", e.target.value)}
            />
          </>
        );

      case "Button":
        return (
          <>
            <div style={labelStyle}>Label</div>
            <input
              style={inputStyle}
              value={props.label || ""}
              onChange={(e) => updateProp("label", e.target.value)}
            />
          </>
        );

      case "Image":
        return (
          <>
            <div style={labelStyle}>Image URL</div>
            <input
              style={inputStyle}
              value={props.src || ""}
              onChange={(e) => updateProp("src", e.target.value)}
            />
          </>
        );

      case "Spacer":
        return (
          <>
            <div style={labelStyle}>Height (px)</div>
            <input
              type="number"
              style={inputStyle}
              value={props.height || 0}
              onChange={(e) => updateProp("height", Number(e.target.value))}
            />
          </>
        );

      case "List":
        return (
          <>
            <div style={labelStyle}>Items (one per line)</div>
            <textarea
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
              value={(props.items || []).join("\n")}
              onChange={(e) =>
                updateProp("items", e.target.value.split("\n").filter(Boolean))
              }
            />
          </>
        );

      default:
        return <div style={{ color: "#777" }}>No editable properties</div>;
    }
  }

  return (
    <div
      ref={panelRef}
      style={{
        height: "100%",
        overflowY: "auto",
        padding: 12,
        fontFamily: "sans-serif",
      }}
    >
      {/* COMPONENT META */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Component
        </div>
        <div style={{ fontSize: 11, color: "#aaa" }}>ID</div>
        <div style={{ fontSize: 12 }}>{id}</div>

        <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Type</div>
        <div style={{ fontSize: 12 }}>{type}</div>
      </div>

      {/* PROPERTIES */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Properties
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {renderFields()}
        </div>
      </div>

      {/* ORDER CONTROLS */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Order
        </div>

        <button
          onClick={() => onMoveComponent(id, "up")}
          disabled={componentIndex === 0}
          style={{
            width: "100%",
            padding: 6,
            background: "#2a2a2a",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 4,
            marginBottom: 6,
            opacity: componentIndex === 0 ? 0.4 : 1,
          }}
        >
          Move Up
        </button>

        <button
          onClick={() => onMoveComponent(id, "down")}
          disabled={componentIndex === totalComponents - 1}
          style={{
            width: "100%",
            padding: 6,
            background: "#2a2a2a",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 4,
            opacity: componentIndex === totalComponents - 1 ? 0.4 : 1,
          }}
        >
          Move Down
        </button>
      </div>

      {/* ACTIONS */}
      <div style={sectionStyle}>
        <button
          onClick={() => onDuplicateComponent(id)}
          style={{
            width: "100%",
            padding: 8,
            background: "#6200ee",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          Duplicate
        </button>

        <button
          onClick={() => onDeleteComponent(id)}
          style={{
            width: "100%",
            padding: 8,
            background: "#ff4d4d",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default PropertyPanel;
