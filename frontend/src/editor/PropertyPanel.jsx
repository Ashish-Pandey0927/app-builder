function PropertyPanel({ selectedComponent, onUpdateComponent }) {
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
          <>
            <label>Text</label>
            <input
              type="text"
              value={props.text || ""}
              onChange={(e) => updateProp("text", e.target.value)}
            />
          </>
        );

      case "Button":
        return (
          <>
            <label>Label</label>
            <input
              type="text"
              value={props.label || ""}
              onChange={(e) => updateProp("label", e.target.value)}
            />
          </>
        );

      case "Image":
        return (
          <>
            <label>Image Source</label>
            <input
              type="text"
              value={props.src || ""}
              onChange={(e) => updateProp("src", e.target.value)}
            />
          </>
        );

      case "Spacer":
        return (
          <>
            <label>Height (px)</label>
            <input
              type="number"
              value={props.height || 0}
              onChange={(e) => updateProp("height", Number(e.target.value))}
            />
          </>
        );

      case "List":
        return (
          <>
            <label>Items (one per line)</label>
            <textarea
              rows={5}
              value={(props.items || []).join("\n")}
              onChange={(e) =>
                updateProp("items", e.target.value.split("\n").filter(Boolean))
              }
            />
          </>
        );

      default:
        return <p>No editable fields for this type</p>;
    }
  }

  return (
    <div>
      <h3>Component Properties</h3>
      <p>
        <strong>ID:</strong> {id}
      </p>
      <p>
        <strong>Type:</strong> {type}
      </p>

      <div style={{ marginTop: 12 }}>{renderFields()}</div>
    </div>
  );
}

export default PropertyPanel;
