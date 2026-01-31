import { useEffect, useRef } from "react";

const shadows = {
  none: "none",
  soft: "0 2px 6px rgba(0,0,0,.15)",
  medium: "0 4px 12px rgba(0,0,0,.25)",
  strong: "0 8px 24px rgba(0,0,0,.35)",
};

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

  const { id, type, props = {}, style = {} } = selectedComponent;

  function updateProp(key, value) {
    onUpdateComponent({
      ...selectedComponent,
      props: {
        ...props,
        [key]: value,
      },
    });
  }

  function updateStyle(key, value) {
    onUpdateComponent({
      ...selectedComponent,
      style: {
        ...style,
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
        return null;
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
      {/* COMPONENT INFO */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Component
        </div>
        <div style={{ fontSize: 11, color: "#aaa" }}>ID</div>
        <div style={{ fontSize: 12 }}>{id}</div>

        <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Type</div>
        <div style={{ fontSize: 12 }}>{type}</div>
      </div>

      {/* CONTENT */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Properties
        </div>
        {renderFields()}
      </div>

      {/* LAYOUT */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Layout
        </div>

        {/* FLEXBOX */}
        <div style={sectionStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Flexbox
          </div>

          <div style={labelStyle}>Display</div>
          <select
            style={inputStyle}
            value={style.display || "block"}
            onChange={(e) => updateStyle("display", e.target.value)}
          >
            <option value="block">Block</option>
            <option value="flex">Flex</option>
          </select>

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
        </div>

        <div style={labelStyle}>Width</div>
        <input
          style={inputStyle}
          value={style.width || ""}
          onChange={(e) => updateStyle("width", e.target.value)}
        />

        <div style={labelStyle}>Height</div>
        <input
          style={inputStyle}
          value={style.height || ""}
          onChange={(e) => updateStyle("height", e.target.value)}
        />

        <div style={labelStyle}>Align</div>
        <select
          style={inputStyle}
          value={style.textAlign || "left"}
          onChange={(e) => updateStyle("textAlign", e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* POSITION */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Position
        </div>

        <select
          style={inputStyle}
          value={style.position || "static"}
          onChange={(e) => updateStyle("position", e.target.value)}
        >
          <option value="static">Static</option>
          <option value="relative">Relative</option>
          <option value="absolute">Absolute</option>
          <option value="fixed">Fixed</option>
        </select>

        {["top", "left", "right", "bottom"].map((pos) => (
          <div key={pos}>
            <div style={labelStyle}>{pos.toUpperCase()} (px)</div>
            <input
              type="number"
              style={inputStyle}
              value={style[pos] || ""}
              onChange={(e) => updateStyle(pos, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      {/* SPACING (Advanced) */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Spacing
        </div>

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

      {/* COLORS */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Colors
        </div>

        <div style={labelStyle}>Background</div>
        <input
          type="color"
          value={style.backgroundColor || "#ffffff"}
          onChange={(e) => updateStyle("backgroundColor", e.target.value)}
        />

        <div style={labelStyle}>Text</div>
        <input
          type="color"
          value={style.color || "#000000"}
          onChange={(e) => updateStyle("color", e.target.value)}
        />
      </div>

      {/* TRANSFORM */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Transform
        </div>

        <div style={labelStyle}>Rotation (deg)</div>
        <input
          type="number"
          style={inputStyle}
          value={style.rotate || 0}
          onChange={(e) =>
            updateStyle("transform", `rotate(${e.target.value}deg)`)
          }
        />
      </div>

      {/* BORDER */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Border
        </div>

        <div style={labelStyle}>Radius</div>
        <input
          type="number"
          style={inputStyle}
          value={style.borderRadius || 0}
          onChange={(e) => updateStyle("borderRadius", Number(e.target.value))}
        />

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
          value={style.borderColor || "#000000"}
          onChange={(e) => updateStyle("borderColor", e.target.value)}
        />
      </div>

      {/* CORNER RADIUS */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Corner Radius
        </div>

        {["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => {
          const key = "border" + c + "Radius";
          return (
            <div key={key}>
              <div style={labelStyle}>{c}</div>
              <input
                type="number"
                style={inputStyle}
                value={style[key] || 0}
                onChange={(e) => updateStyle(key, Number(e.target.value))}
              />
            </div>
          );
        })}
      </div>

      {/* SHADOW */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Shadow
        </div>

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

      {/* FILL & STROKE */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Fill & Stroke
        </div>

        <div style={labelStyle}>Fill Color</div>
        <input
          type="color"
          value={style.backgroundColor || "#ffffff"}
          onChange={(e) => updateStyle("backgroundColor", e.target.value)}
        />

        <div style={labelStyle}>Stroke Width</div>
        <input
          type="number"
          style={inputStyle}
          value={style.borderWidth || 0}
          onChange={(e) => updateStyle("borderWidth", Number(e.target.value))}
        />

        <div style={labelStyle}>Stroke Color</div>
        <input
          type="color"
          value={style.borderColor || "#000000"}
          onChange={(e) => updateStyle("borderColor", e.target.value)}
        />
      </div>

      {/* TYPOGRAPHY */}
      {(type === "Text" || type === "Button") && (
        <div style={sectionStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Typography
          </div>

          <div style={labelStyle}>Font Size</div>
          <input
            type="number"
            style={inputStyle}
            value={style.fontSize || 14}
            onChange={(e) => updateStyle("fontSize", Number(e.target.value))}
          />

          <div style={labelStyle}>Font Weight</div>
          <select
            style={inputStyle}
            value={style.fontWeight || "400"}
            onChange={(e) => updateStyle("fontWeight", e.target.value)}
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
          </select>
        </div>
      )}

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
