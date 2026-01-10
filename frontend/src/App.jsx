import React, { useState, useEffect } from "react";
import appSchema from "./data/simple-app.json";
import AppRenderer from "./renderer/AppRenderer";
import PropertyPanel from "./editor/PropertyPanel";

const App = () => {
  
  const [schema, setSchema] = useState(() => {
    const saved = localStorage.getItem("app_schema");
    return saved ? JSON.parse(saved) : appSchema;
  });
  useEffect(() => {
    localStorage.setItem("app_schema", JSON.stringify(schema));
  }, [schema]);

  const [currentScreenId, setCurrentScreenId] = useState(() => {
  const saved = localStorage.getItem("app_schema");
  if (saved) {
    const parsed = JSON.parse(saved);
    return parsed.screens[0].id;
  }
  return appSchema.screens[0].id;
});
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  function updateComponent(updatedComponent) {
    setSchema((prevSchema) => {
      const newScreens = prevSchema.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        return {
          ...screen,
          components: screen.components.map((comp) =>
            comp.id === updatedComponent.id ? updatedComponent : comp
          ),
        };
      });

      return {
        ...prevSchema,
        screens: newScreens,
      };
    });
  }
  const currentScreen = schema.screens.find((s) => s.id === currentScreenId);

  const selectedComponent = currentScreen?.components.find(
    (c) => c.id === selectedComponentId
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* App Preview  */}
      <div style={{ flex: 1, padding: 20 }}>
        <AppRenderer
          schema={schema}
          currentScreenId={currentScreenId}
          onNavigate={setCurrentScreenId}
          selectedComponentId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
        />
      </div>

      {/* Property Panel */}
      <div
        style={{
          width: 300,
          borderLeft: "1px solid #ddd",
          padding: 12,
          background: "#fafafa",
        }}
      >
        <PropertyPanel
          selectedComponent={selectedComponent}
          onUpdateComponent={updateComponent}
        />
      </div>

      {/* <h3>Renderer Test</h3> */}
      {/* <pre>{JSON.stringify(appSchema, null, 2)}</pre> */}
    </div>
  );
};

export default App;
