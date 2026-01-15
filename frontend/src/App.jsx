import React, { useState, useEffect } from "react";
import appSchema from "./data/simple-app.json";
import AppRenderer from "./renderer/AppRenderer";
import PropertyPanel from "./editor/PropertyPanel";
import ComponentTree from "./editor/ComponentTree";
import PublishedRenderer from "./renderer/PublishedRenderer";

const App = () => {
  const [schema, setSchema] = useState(() => {
    const saved = localStorage.getItem("app_schema");
    return saved ? JSON.parse(saved) : appSchema;
  });
  useEffect(() => {
    localStorage.setItem("app_schema", JSON.stringify(schema));
  }, [schema]);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const [currentScreenId, setCurrentScreenId] = useState(() => {
    const saved = localStorage.getItem("app_schema");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.screens[0].id;
    }
    return appSchema.screens[0].id;
  });
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!selectedComponentId) return;

      // Delete key
      if (e.key === "Delete") {
        deleteComponent(selectedComponentId);
      }

      // Ctrl + D or Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateComponent(selectedComponentId);
      }

      // Escape clears selection
      if (e.key === "Escape") {
        setSelectedComponentId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponentId]);

  function updateComponent(updatedComponent) {
    const updateInTree = (components) => {
      return components.map((comp) => {
        if (comp.id === updatedComponent.id) {
          return updatedComponent;
        }

        if (comp.type === "Container" && comp.children) {
          return {
            ...comp,
            children: updateInTree(comp.children),
          };
        }

        return comp;
      });
    };

    pushToHistory();
    setSchema((prevSchema) => {
      const newScreens = prevSchema.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        return {
          ...screen,
          components: updateInTree(screen.components),
        };
      });

      return {
        ...prevSchema,
        screens: newScreens,
      };
    });
  }

  function createNewComponent(type) {
    const id = `${type.toLowerCase()}_${Date.now()}`;

    switch (type) {
      case "Text":
        return {
          id,
          type: "Text",
          props: { text: "New Text" },
          style: {},
        };

      case "Button":
        return {
          id,
          type: "Button",
          props: {
            label: "New Button",
            action: {
              type: "navigate",
              targetScreenId: currentScreenId,
            },
          },
          style: {},
        };

      case "Image":
        return {
          id,
          type: "Image",
          props: {
            src: "https://via.placeholder.com/300x150",
            alt: "Placeholder Image",
          },
          style: {},
        };

      case "Spacer":
        return {
          id,
          type: "Spacer",
          props: { height: 20 },
          style: {},
        };

      case "List":
        return {
          id,
          type: "List",
          props: {
            items: ["Item 1", "Item 2", "Item 3"],
          },
          style: {},
        };
      case "Container":
        return {
          id,
          type: "Container",
          children: [],
          style: {
            padding: 10,
            border: "1px solid #999",
          },
        };

      default:
        return null;
    }
  }

  function addComponent(type) {
    const newComponent = createNewComponent(type);

    pushToHistory();
    setSchema((prevSchema) => {
      const newScreens = prevSchema.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        // If selected component is a container, add inside it
        if (selectedComponent && selectedComponent.type === "Container") {
          const addToContainer = (components) => {
            return components.map((comp) => {
              if (
                comp.id === selectedComponentId &&
                comp.type === "Container"
              ) {
                return {
                  ...comp,
                  children: [...comp.children, newComponent],
                };
              }

              // If this component itself has children, recurse
              if (comp.type === "Container" && comp.children) {
                return {
                  ...comp,
                  children: addToContainer(comp.children),
                };
              }

              return comp;
            });
          };

          return {
            ...screen,
            components: addToContainer(screen.components),
          };
        }

        // Otherwise add to screen root
        return {
          ...screen,
          components: [...screen.components, newComponent],
        };
      });

      return {
        ...prevSchema,
        screens: newScreens,
      };
    });
  }

  function deleteComponent(componentId) {
    const removeFromTree = (components) => {
      return components
        .filter((comp) => comp.id !== componentId)
        .map((comp) => {
          if (comp.type === "Container" && comp.children) {
            return {
              ...comp,
              children: removeFromTree(comp.children),
            };
          }
          return comp;
        });
    };

    pushToHistory();
    setSchema((prev) => {
      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        return {
          ...screen,
          components: removeFromTree(screen.components),
        };
      });

      return { ...prev, screens: newScreens };
    });

    setSelectedComponentId(null);
  }

  function duplicateComponent(componentId) {
    const dublicateInTree = (components) => {
      const result = [];

      for (let comp of components) {
        result.push(comp);

        if (comp.id === componentId) {
          const cloned = {
            ...comp,
            id: `${comp.type.toLowerCase()}_${Date.now()}`,
          };
          result.push(cloned);
        }

        if (comp.type === "Container" && comp.children) {
          result[result.length - 1] = {
            ...comp,
            children: dublicateInTree(comp.children),
          };
        }
      }

      return result;
    };

    pushToHistory();
    setSchema((prev) => {
      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        return {
          ...screen,
          components: dublicateInTree(screen.components),
        };
      });

      return { ...prev, screens: newScreens };
    });
  }

  function moveComponent(componentId, direction) {
    const moveInTree = (components) => {
      const index = components.findIndex((c) => c.id === componentId);
      if (index !== -1) {
        const newArr = [...components];
        const newIndex = direction === "up" ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newArr.length) return components;

        const temp = newArr[index];
        newArr[index] = newArr[newIndex];
        newArr[newIndex] = temp;

        return newArr;
      }

      return components.map((comp) => {
        if (comp.type === "Container" && comp.children) {
          return {
            ...comp,
            children: moveInTree(comp.children),
          };
        }
        return comp;
      });
    };

    setSchema((prev) => {
      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        return {
          ...screen,
          components: moveInTree(screen.components),
        };
      });

      return { ...prev, screens: newScreens };
    });
  }

  function reorderComponent(draggedId, targetId, position) {
    const reorderInTree = (components) => {
      const fromIndex = components.findIndex((c) => c.id === draggedId);
      const toIndex = components.findIndex((c) => c.id === targetId);

      // Same parent → reorder here
      if (fromIndex !== -1 && toIndex !== -1) {
        const newArr = [...components];
        const [moved] = newArr.splice(fromIndex, 1);

        let insertIndex = toIndex;
        if (position === "after") insertIndex++;
        if (fromIndex < toIndex) insertIndex--;

        newArr.splice(insertIndex, 0, moved);
        return newArr;
      }

      // Otherwise recurse deeper
      return components.map((comp) => {
        if (comp.type === "Container" && comp.children) {
          return {
            ...comp,
            children: reorderInTree(comp.children),
          };
        }
        return comp;
      });
    };

    pushToHistory();
    setSchema((prev) => {
      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        return {
          ...screen,
          components: reorderInTree(screen.components),
        };
      });

      return { ...prev, screens: newScreens };
    });
  }

  // setSchema(prev => {
  //   const newScreens = prev.screens.map(screen => {
  //     if (screen.id !== currentScreenId) return screen;

  //     return {
  //       ...screen,
  //       components: reorderInTree(screen.components)
  //     };
  //   });

  //   return { ...prev, screens: newScreens };
  // });

  function moveComponentIntoContainer(draggedId, containerId) {
    pushToHistory();
    setSchema((prev) => {
      let draggedComponent = null;

      const removeFromTree = (components) => {
        const newComponents = [];

        for (let comp of components) {
          if (comp.id === draggedId) {
            draggedComponent = comp;
            continue;
          }

          if (comp.type === "Container" && comp.children) {
            const updated = removeFromTree(comp.children);
            newComponents.push({ ...comp, children: updated });
          } else {
            newComponents.push(comp);
          }
        }

        return newComponents;
      };

      const addToTree = (components) => {
        if (containerId === null) {
          // Drop to root
          return [...components, draggedComponent];
        }

        return components.map((comp) => {
          if (comp.id === containerId && comp.type === "Container") {
            return {
              ...comp,
              children: [...comp.children, draggedComponent],
            };
          }

          if (comp.type === "Container") {
            return {
              ...comp,
              children: addToTree(comp.children),
            };
          }

          return comp;
        });
      };

      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== currentScreenId) return screen;

        const cleaned = removeFromTree(screen.components);
        const rebuilt = addToTree(cleaned);

        return {
          ...screen,
          components: rebuilt,
        };
      });

      return { ...prev, screens: newScreens };
    });
  }

  function pushToHistory() {
    setHistory((prev) => {
      const snapshot = JSON.parse(JSON.stringify(schema));
      const newHistory = [...prev, snapshot];
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setFuture([]);
  }

  function undo() {
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);

    setFuture((prev) => [schema, ...prev]);
    setHistory(newHistory);
    setSchema(previous);
  }

  function redo() {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setHistory((prev) => [...prev, schema]);
    setFuture(newFuture);
    setSchema(next);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }

      // Ctrl+Shift+Z (Mac style redo)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "z"
      ) {
        e.preventDefault();
        redo();
      }

      if (!selectedComponentId) return;

      if (e.key === "Delete") {
        deleteComponent(selectedComponentId);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateComponent(selectedComponentId);
      }

      if (e.key === "Escape") {
        setSelectedComponentId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponentId, history, future, schema]);

  const screens = schema.screens;
  const currentScreen = schema.screens.find((s) => s.id === currentScreenId);

  function findComponentById(components, id) {
    for (let comp of components) {
      if (comp.id === id) return comp;

      if (comp.type === "Container" && comp.children) {
        const found = findComponentById(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function exportSchema() {
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app-schema.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function exportPublishHTML() {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <script>
    const schema = ${JSON.stringify(schema)};
    console.log("Load schema here");
  </script>
</body>
</html>
`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "published-app.html";
    a.click();
  }

  function importSchema(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setSchema(data);
        setSelectedComponentId(null);
        setCurrentScreenId(data.screens[0].id);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  function resetProject() {
    if (confirm("This will delete everything. Sure?")) {
      setSchema(appSchema);
      localStorage.removeItem("app_schema");
    }
  }

  const selectedComponent = currentScreen
    ? findComponentById(currentScreen.components, selectedComponentId)
    : null;

  const componentIndex = currentScreen?.components.findIndex(
    (c) => c.id === selectedComponentId
  );

  const totalComponents = currentScreen?.components.length;

  // const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mode, setMode] = useState("builder");
  // builder | preview | publish

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 50px)",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Screen Switcher */}
        <div
          style={{
            width: 180,
            borderRight: "1px solid #ddd",
            padding: 12,
            background: "#f5f5f5",
            overflowY: "auto",
          }}
        >
          <input
            type="file"
            accept=".json"
            onChange={(e) => importSchema(e.target.files[0])}
          />

          <button
            onClick={resetProject}
            style={{ background: "#ff4d4d", color: "#fff" }}
          >
            Reset Project
          </button>

          <h4>Screens</h4>
          {screens.map((screen) => (
            <div
              key={screen.id}
              onClick={() => {
                setCurrentScreenId(screen.id);
                setSelectedComponentId(null);
              }}
              style={{
                padding: "8px 12px",
                marginBottom: 8,
                cursor: "pointer",
                background:
                  currentScreenId === screen.id ? "#6200ee" : "transparent",
                color: currentScreenId === screen.id ? "#fff" : "#000",
              }}
            >
              {screen.name}
            </div>
          ))}
        </div>

        {/* Component Tree */}
        <div
          style={{
            width: 220,
            borderRight: "1px solid #ddd",
            padding: 8,
            overflowY: "auto",
            background: "#fafafa",
          }}
        >
          <h4>Components</h4>
          <ComponentTree
            components={currentScreen.components}
            selectedId={selectedComponentId}
            onSelect={setSelectedComponentId}
          />
        </div>

        {/* App Preview  */}
        <div
          style={{
            flex: 1,
            padding: 20,
            background: "fafafa",
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
          }}
          onClick={() => setSelectedComponentId(null)}
        >
          <div style={{ width: 360 }}>
            {mode === "publish" ? (
              <PublishedRenderer
                schema={schema}
                screenId={currentScreenId}
                onNavigate={setCurrentScreenId}
              />
            ) : (
              <AppRenderer
                schema={schema}
                currentScreenId={currentScreenId}
                onNavigate={setCurrentScreenId}
                selectedComponentId={selectedComponentId}
                onSelectComponent={setSelectedComponentId}
                onReorderComponent={reorderComponent}
                onMoveIntoContainer={moveComponentIntoContainer}
                mode={mode}
              />
            )}
          </div>
        </div>

        {/* Property Panel */}

        {mode !== "publish" && (
          <div
            style={{
              width: 300,
              borderLeft: "1px solid #ddd",
              padding: 12,
              background: "#fafafa",
              overflowY: "auto",
            }}
          >
            {/* {mode === "publish" && (
            <div
              style={{
                position: "fixed",
                top: 10,
                width: "100%",
                background: "#222",
                color: "#fff",
                padding: "6px",
                textAlign: "center",
                zIndex: 9999,
              }}
            >
              Published App View
            </div>
          )} */}

            <div
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: "1px solid #ddd",
              }}
            >
              <h4>
                Add Component{" "}
                {selectedComponent && selectedComponent.type === "Container"
                  ? "Inside Container"
                  : "To Screen"}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Text", "Button", "Image", "Spacer", "List", "Container"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => addComponent(type)}
                      disabled={
                        selectedComponent &&
                        selectedComponent.type !== "Container"
                      }
                      style={{
                        padding: "6px",
                        fontSize: 12,
                        cursor:
                          selectedComponent &&
                          selectedComponent.type !== "Container"
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          selectedComponent &&
                          selectedComponent.type !== "Container"
                            ? 0.5
                            : 1,
                      }}
                    >
                      + {type}
                    </button>
                  )
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <button
                onClick={undo}
                disabled={history.length === 0}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: history.length === 0 ? "#eee" : "#ddd",
                  cursor: history.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Undo
              </button>

              <button
                onClick={redo}
                disabled={future.length === 0}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: future.length === 0 ? "#eee" : "#ddd",
                  cursor: future.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Redo
              </button>
            </div>

            <PropertyPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={updateComponent}
              onDeleteComponent={deleteComponent}
              onDuplicateComponent={duplicateComponent}
              onMoveComponent={moveComponent}
              componentIndex={componentIndex}
              totalComponents={totalComponents}
            />
          </div>
        )}

        {/* <h3>Renderer Test</h3> */}
        {/* <pre>{JSON.stringify(appSchema, null, 2)}</pre> */}
      </div>
      <div
        style={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          background: "#1e1e1e",
          padding: "10px",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          zIndex: 9999,
          borderTop: "1px solid #333",
        }}
      >
        {mode === "publish" && (
          <button
            onClick={exportPublishHTML}
            style={{
              padding: "8px 16px",
              background: "#6200ee",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Export Published HTML
          </button>
        )}

        
        <button onClick={() => setMode("builder")}>Builder</button>
        <button onClick={() => setMode("preview")}>Preview</button>
        <button onClick={() => setMode("publish")}>Publish</button>
      
      </div>
    </>
  );
};

export default App;
