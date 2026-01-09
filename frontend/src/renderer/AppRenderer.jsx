function AppRenderer({ schema, currentScreenId, onNavigate }) {
  if (!schema || !Array.isArray(schema.screens)) {
    return <p>Invalid app schema</p>;
  }

  const screen = schema.screens.find((s) => s.id === currentScreenId);

  if (!screen) {
    console.error("Screen not found:", currentScreenId);
    return <p>Screen not found</p>;
  }

  function renderComponent(component) {
    if (!component || !component.type || !component.id) {
      console.error("Invalid component structure:", component);
      return null;
    }
    const { id, type, props = {} } = component;

    switch (type) {
      case "Text":
        if (!props.text) {
          console.error("Text component missing text:", component);
          return null;
        }
        return (
          <p key={id} {...props}>
            {props.text}
          </p>
        );

      case "Image":
        return (
          <img
            key={id}
            {...props}
            src={props.src}
            alt=""
            style={{ width: "100%", margin: "8px 0" }}
          />
        );

      case "Button":
        if (!props.label || !props.action) {
          console.error("Button missing props:", component);
          return null;
        }
        return (
          <button
            key={id}
            {...props}
            onClick={() => {
              if (props.action?.type === "navigate") {
                onNavigate(props.action.targetScreenId);
              }
            }}
            style={{ display: "block", margin: "8px 0" }}
          >
            {props.label}
          </button>
        );
      case "List":
        if (!Array.isArray(props.items)) {
          console.error("List items must be an array:", component);
          return null;
        }
        return (
          <ul key={id}>
            {props.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );

      case "Spacer":
        if (typeof props.height !== "number") {
          console.error("Spacer height must be a number:", component);
          return null;
        }
        return <div key={id} style={{ height: props.height }} />;

      default:
        console.error("Unknown component type:", type);
        return null;
    }
  }
  return (
    <div>
      <h1>{schema.app.name}</h1>
      <h2>{screen.name}</h2>
      {screen.components.map(renderComponent)}
      {/* <p>Renderer not implemented yet.</p> */}
    </div>
  );
}

export default AppRenderer;
