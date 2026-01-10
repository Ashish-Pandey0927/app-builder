function AppRenderer({
  schema,
  currentScreenId,
  onNavigate,
  selectedComponentId,
  onSelectComponent,
}) {
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

    const isSelected = id === selectedComponentId;

    const wrapperStyle = {
      border: isSelected ? "2px solid #6200ee" : "1px dashed transparent",
      padding: 4,
      margin: "4px 0",
      cursor: "pointer",
      background: isSelected ? "#f2edff" : "transparent",
    };

    function handleSelect(e) {
      e.stopPropagation();
      onSelectComponent(id);
    }

    let content = null;

    switch (type) {
      case "Text":
        if (!props.text) {
          console.error("Text component missing text:", component);
          return null;
        }
        content = <p>{props.text}</p>;
        break;

      case "Image":
        if (!props.src) {
          console.error("Image component missing src:", component);
          return null;
        }
        content = (
          <img
            src={props.src}
            alt=""
            style={{ width: "100%", margin: "8px 0" }}
          />
        );
        break;

      case "Button":
        if (!props.label || !props.action) {
          console.error("Button missing props:", component);
          return null;
        }
        content = (
          <button
            onClick={(e) => {
              e.stopPropagation(); // stop selection click from triggering
              if (props.action.type === "navigate") {
                onNavigate(props.action.targetScreenId);
              }
            }}
            style={{ display: "block", margin: "8px 0" }}
          >
            {props.label}
          </button>
        );
        break;

      case "List":
        if (!Array.isArray(props.items)) {
          console.error("List items must be an array:", component);
          return null;
        }
        content = (
          <ul>
            {props.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
        break;

      case "Spacer":
        if (typeof props.height !== "number") {
          console.error("Spacer height must be a number:", component);
          return null;
        }
        content = <div style={{ height: props.height }} />;
        break;

      default:
        console.error("Unknown component type:", type);
        return null;
    }

    return (
      <div key={id} style={wrapperStyle} onClick={handleSelect}>
        {content}
      </div>
    );
  }
  return (
    <div>
      <h2>{screen.name}</h2>
      {screen.components.map(renderComponent)}
    </div>
  );
}

export default AppRenderer;
