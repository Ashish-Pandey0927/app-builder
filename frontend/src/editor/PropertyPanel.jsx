import { useEffect, useRef } from "react";

const shadows = {
  none: "none",
  soft: "0 2px 6px rgba(0,0,0,.15)",
  medium: "0 4px 12px rgba(0,0,0,.25)",
  strong: "0 8px 24px rgba(0,0,0,.35)",
};

function PropertyPanel({
  selectedComponent,
  currentScreen,
  onUpdateComponent,
  onUpdateScreen,
  onDeleteComponent,
  onDuplicateComponent,
  componentIndex,
  totalComponents,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedComponent, currentScreen]);

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

  const subSectionStyle = {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #333",
  };

  /* ===============================
     SCREEN PROPERTIES (NO SELECTION)
     =============================== */
  if (!selectedComponent && currentScreen) {
    return (
      <div
        ref={panelRef}
        style={{ height: "100%", overflowY: "auto", padding: 12 }}
      >
        <div style={sectionStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Screen
          </div>

          <div style={labelStyle}>Background Color</div>
          <input
            type="color"
            value={currentScreen.style?.backgroundColor || "#ffffff"}
            onChange={(e) => onUpdateScreen("backgroundColor", e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (!selectedComponent) {
    return (
      <div style={{ color: "#777", fontSize: 13, padding: 12 }}>
        Select a component to edit its properties.
      </div>
    );
  }

  const { id, type, props = {}, style = {} } = selectedComponent;

  function updateProp(key, value) {
    onUpdateComponent({
      ...selectedComponent,
      props: { ...props, [key]: value },
    });
  }

  function updateStyle(key, value) {
    onUpdateComponent({
      ...selectedComponent,
      style: { ...style, [key]: value },
    });
  }

  const rotation = style.transform?.match(/rotate\(([-\d.]+)deg\)/)?.[1] || 0;

  /* ===============================
     COMPONENT PROPERTIES
     =============================== */
  return (
    <div
      ref={panelRef}
      style={{ height: "100%", overflowY: "auto", padding: 12 }}
    >
      {/* COMPONENT INFO */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Component</div>
        <div style={{ fontSize: 11, color: "#aaa" }}>ID</div>
        <div style={{ fontSize: 12 }}>{id}</div>

        <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Type</div>
        <div style={{ fontSize: 12 }}>{type}</div>
      </div>

      {/* CONTENT */}
      {(type === "Text" || type === "Button" || type === "Image" || type === "List" || type === "Spacer") && (
        <div style={sectionStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Content
          </div>

          {type === "Text" && (
            <>
              <div style={labelStyle}>Text</div>
              <input
                style={inputStyle}
                value={props.text || ""}
                onChange={(e) => updateProp("text", e.target.value)}
              />
            </>
          )}

          {type === "Button" && (
            <>
              <div style={labelStyle}>Label</div>
              <input
                style={inputStyle}
                value={props.label || ""}
                onChange={(e) => updateProp("label", e.target.value)}
              />
            </>
          )}

          {type === "Image" && (
            <>
              <div style={labelStyle}>Image URL</div>
              <input
                style={inputStyle}
                value={props.src || ""}
                onChange={(e) => updateProp("src", e.target.value)}
              />
            </>
          )}
          {type === "List" && (
            <>
              <div style={labelStyle}>Items (comma separated)</div>
              <input
                style={inputStyle}
                value={props.items ? props.items.join(", ") : ""}
                onChange={(e) =>
                  updateProp("items", e.target.value.split(",").map(item => item.trim()))
                }
              />
            </>
          )}

          {type === "Spacer" && (
            <>
              <div style={labelStyle}>Height (px)</div>
              <input
                type="number"
                style={inputStyle}
                value={props.height || 0}
                onChange={(e) => updateProp("height", Number(e.target.value))}
              />
            </>
          )}
        </div>
      )}

      {/* FLEXBOX */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Layout</div>

        <div style={subSectionStyle}>
          <div style={labelStyle}>Display</div>
          <select
            style={inputStyle}
            value={style.display || "block"}
            onChange={(e) => updateStyle("display", e.target.value)}
          >
            <option value="block">Block</option>
            <option value="flex">Flex</option>
          </select>

          {style.display === "flex" && (
            <>
              <div style={labelStyle}>Direction</div>
              <select
                style={inputStyle}
                value={style.flexDirection || "row"}
                onChange={(e) => updateStyle("flexDirection", e.target.value)}
              >
                <option value="row">Row</option>
                <option value="column">Column</option>
              </select>

              <div style={labelStyle}>Justify</div>
              <select
                style={inputStyle}
                value={style.justifyContent || "flex-start"}
                onChange={(e) => updateStyle("justifyContent", e.target.value)}
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
              </select>

              <div style={labelStyle}>Align Items</div>
              <select
                style={inputStyle}
                value={style.alignItems || "stretch"}
                onChange={(e) => updateStyle("alignItems", e.target.value)}
              >
                <option value="stretch">Stretch</option>
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* TYPOGRAPHY  */}
      {(type === "Text" || type === "Button" || type === "List") && (
        <div style={sectionStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Typography
          </div>
          <div style={labelStyle}>Font Size (px)</div>
          <input
            type="number"
            style={inputStyle}
            value={style.fontSize || 14}
            onChange={(e) => updateStyle("fontSize", Number(e.target.value))}
          />

          <div style={labelStyle}>Font Weight</div>
          <select
            style={inputStyle}    
            value={style.fontWeight || "normal"}
            onChange={(e) => updateStyle("fontWeight", e.target.value)}
          >
            <option value="400">Normal</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
          </select>
        </div>
      )}


      {/* SPACING */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Spacing</div>

        <div style={labelStyle}>Padding X</div>
        <input
          type="number"
          style={inputStyle}
          value={style.paddingLeft || 0}
          onChange={(e) => {
            updateStyle("paddingLeft", Number(e.target.value));
            updateStyle("paddingRight", Number(e.target.value));
          }}
        />

        <div style={labelStyle}>Padding Y</div>
        <input
          type="number"
          style={inputStyle}
          value={style.paddingTop || 0}
          onChange={(e) => {
            updateStyle("paddingTop", Number(e.target.value));
            updateStyle("paddingBottom", Number(e.target.value));
          }}
        />

        <div style={labelStyle}>Margin X</div>
        <input
          type="number"
          style={inputStyle}
          value={style.marginLeft || 0}
          onChange={(e) => {
            updateStyle("marginLeft", Number(e.target.value));
            updateStyle("marginRight", Number(e.target.value));
          }}
        />
        <div style={labelStyle}>Margin Y</div>
        <input
          type="number"
          style={inputStyle}
          value={style.marginTop || 0}
          onChange={(e) => {
            updateStyle("marginTop", Number(e.target.value));
            updateStyle("marginBottom", Number(e.target.value));
          }}
        />
      </div>

      {/* VISUAL */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Visual
        </div>

        <div style={labelStyle}>
          Background
        </div>
        <input 
        type="color"
        value={style.backgroundColor || "#ffffff"}
        onChange={(e) =>
          updateStyle("backgroundColor", e.target.value)
        }
        />

        <div style={labelStyle}>Text Color</div>
        <input type="color" value={style.color || "#000000"} onChange={(e) => updateStyle("color", e.target.value)} />
      </div>

      {/* BORDER  */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Border</div>

        <div style={labelStyle}>Width</div>
        <input
          type="number"
          style={inputStyle}
          value={style.borderWidth || 0}
          onChange={(e) => updateStyle("borderWidth", Number(e.target.value))}
        />

        <div style={labelStyle}>Color</div>
        <input
          type="color"
          style={inputStyle}
          value={style.borderColor || "#000000"}
          onChange={(e) => updateStyle("borderColor", e.target.value)}
        />

        <div style={labelStyle}>Radius</div>
        <input
          type="number"
          style={inputStyle}
          value={style.borderRadius || 0}
          onChange={(e) => updateStyle("borderRadius", Number(e.target.value))}
        />
      </div>

      {/* TRANSFORM */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Transform</div>

        <div style={labelStyle}>Rotation (deg)</div>
        <input
          type="number"
          style={inputStyle}
          value={rotation}
          onChange={(e) =>
            updateStyle("transform", `rotate(${e.target.value}deg)`)
          }
        />
      </div>

      {/* SHADOW */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Shadow</div>
        <select
          style={inputStyle}
          value={
            Object.keys(shadows).find((k) => shadows[k] === style.boxShadow) ||
            "none"
          }
          onChange={(e) => updateStyle("boxShadow", shadows[e.target.value])}
        >
          <option value="none">None</option>
          <option value="soft">Soft</option>
          <option value="medium">Medium</option>
          <option value="strong">Strong</option>
        </select>
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
