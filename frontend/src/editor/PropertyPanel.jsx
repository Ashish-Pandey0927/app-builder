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
    return <p>No component selected</p>;
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

  function renderFields() {
    switch (type) {
      case "Text":
        return (
          <div>
            <label style={{ fontSize: 12, color: "#555" }}>Text</label>
            <input
              type="text"
              value={props.text || ""}
              onChange={(e) => updateProp("text", e.target.value)}
              style={{ width: "100%", padding: 6 }}
            />
          </div>
        );

      case "Button":
        return (
          <>
            <label style={{ fontSize: 12, color: "#555" }}>Label</label>
            <input
              type="text"
              value={props.label || ""}
              onChange={(e) => updateProp("label", e.target.value)}
              style={{ width: "100%", padding: 6 }}
            />
          </>
        );

      case "Image":
        return (
          <>
            <label style={{ fontSize: 12, color: "#555" }}>Image Source</label>
            <input
              type="text"
              value={props.src || ""}
              onChange={(e) => updateProp("src", e.target.value)}
              style={{ width: "100%", padding: 6 }}
            />
          </>
        );

      case "Spacer":
        return (
          <>
            <label style={{ fontSize: 12, color: "#555" }}>Height (px)</label>
            <input
              type="number"
              value={props.height || 0}
              onChange={(e) => updateProp("height", Number(e.target.value))}
              style={{ width: "100%", padding: 6 }}
            />
          </>
        );

      case "List":
        return (
          <>
            <label style={{ fontSize: 12, color: "#555" }}>
              Items (one per line)
            </label>
            <textarea
              rows={5}
              value={(props.items || []).join("\n")}
              onChange={(e) =>
                updateProp("items", e.target.value.split("\n").filter(Boolean))
              }
              style={{ width: "100%", padding: 6 }}
            />
          </>
        );

      default:
        return <p>No editable fields for this type</p>;
    }
  }
  // const isNested = componentIndex === -1;

  return (
    <div ref={panelRef} style={{ overflowY: "auto", height: "100%" }}>
      <div style={{ fontSize: 14 }}>
        {/* Component Info Section  */}
        <div
          style={{
            borderBottom: "1px solid #ddd",
            paddingBottom: 10,
            marginBottom: 12,
          }}
        >
          <h4 style={{ margin: "0 0 6px 0" }}>Component Info</h4>
          <p>
            <strong>ID:</strong> {id}
          </p>
          <p>
            <strong>Type:</strong> {type}
          </p>
        </div>

        {/* Editable Fields Section  */}
        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>Properties</h4>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderBottom: "1px solid #ddd",
              paddingBottom: 10,
              marginBottom: 12,
            }}
          >
            {renderFields()}
          </div>
        </div>
      </div>
      {/* Duplicate Button  */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => onDuplicateComponent(id)}
          style={{
            width: "100%",
            padding: "8px",
            background: "#6200ee",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Duplicate Component
        </button>
      </div>

      {/* Move Up/Down Buttons  */}
      {/* {!isNested && (
        <> */}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => onMoveComponent(id, "up")}
              disabled={componentIndex === 0}
              style={{
                width: "100%",
                padding: "6px",
                marginBottom: 6,
                background: componentIndex === 0 ? "#f0f0f0" : "#ddd",
                border: "none",
                cursor: componentIndex === 0 ? "not-allowed" : "pointer",
                opacity: componentIndex === 0 ? 0.5 : 1,
              }}
            >
              ↑ Move Up
            </button>

            <button
              onClick={() => onMoveComponent(id, "down")}
              disabled={componentIndex === totalComponents - 1}
              style={{
                width: "100%",
                padding: "6px",
                background:
                  componentIndex === totalComponents - 1 ? "#f0f0f0" : "#ddd",
                border: "none",
                cursor:
                  componentIndex === totalComponents - 1
                    ? "not-allowed"
                    : "pointer",
                opacity: componentIndex === totalComponents - 1 ? 0.5 : 1,
              }}
            >
              ↓ Move Down
            </button>
          </div>
        {/* </>
      )} */}

      {/* Delete Button  */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => onDeleteComponent(id)}
          style={{
            width: "100%",
            padding: "8px",
            background: "#ff4d4d",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Delete Component
        </button>
      </div>
    </div>
  );
}

export default PropertyPanel;
