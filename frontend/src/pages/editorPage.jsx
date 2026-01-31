import React, { useState, useEffect, useRef } from "react";
import appSchema from "../data/simple-app.json";
import AppRenderer from "../renderer/AppRenderer";
import PropertyPanel from "../editor/PropertyPanel";
import ComponentTree from "../editor/ComponentTree";
import PublishedRenderer from "../renderer/PublishedRenderer";
import ThemeSelector from "../editor/ThemeSelector";
import { MdOutlineSplitscreen } from "react-icons/md";
import { style } from "../style/style";
import JSZip from "jszip";
import { themes } from "../themes/themes";

const editorPage = ({ initialSchema }) => {
  const [schema, setSchema] = useState(() => ({
    ...initialSchema,
    theme: initialSchema.theme || themes.minimal,
  }));
  if (!schema || !schema.screens || !Array.isArray(schema.screens)) {
    return <div>Invalid schema loaded</div>;
  }
  useEffect(() => {
    localStorage.setItem("app_schema", JSON.stringify(schema));
  }, [schema]);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const screens = schema.screens;

  //   const [currentScreenId, setCurrentScreenId] = useState(() => {
  //     const saved = localStorage.getItem("app_schema");
  //     if (saved) {
  //       const parsed = JSON.parse(saved);
  //       return parsed.screens[0].id;
  //     }
  //     return appSchema.screens[0].id;
  //   });
  const [currentScreenId, setCurrentScreenId] = useState(
    initialSchema.screens[0].id,
  );
  const currentScreen = schema.screens.find((s) => s.id === currentScreenId);
  const [leftTab, setLeftTab] = useState("layers");

  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const selectedComponent = currentScreen
    ? findComponentById(currentScreen.components, selectedComponentId)
    : null;

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

  async function exportPublishHTML() {
    const zip = new JSZip();
    // Load icons from local public folder instead of internet
    const icon192 = await fetch("/icons/icon-192.png").then((r) => r.blob());
    const icon512 = await fetch("/icons/icon-512.png").then((r) => r.blob());

    const iconsFolder = zip.folder("icons");
    iconsFolder.file("icon-192.png", icon192);
    iconsFolder.file("icon-512.png", icon512);

    // 1. HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Published App</title>

  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="theme-color" content="#000000">

  <link rel="manifest" href="manifest.json" />

  <script>
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js");
      });
    }
  </script>

  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #000;
      font-family: system-ui, sans-serif;
    }

    /* Root container becomes the app */
    #app {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
    }

    /* Actual mobile screen */
    .screen {
      width: 100%;
      max-width: 420px;
      height: 100%;
      background: #ffffff;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    button {
      font: inherit;
      cursor: pointer;
      border: none;
      outline: none;
    }

    img {
      max-width: 100%;
      display: block;
    }
  </style>
</head>

<body>
  <div id="app"></div>

  <script>
    const schema = ${JSON.stringify(schema, null, 2)};
    let currentScreenId = schema.screens[0].id;

    const defaultTheme = {
      colors: {
        background: "#ffffff",
        surface: "#f5f5f5",
        primary: "#6200ee",
        text: "#000000",
        border: "#dddddd"
      },
      font: "system-ui, sans-serif",
      radius: 8,
      spacing: 8
    };

    const theme = {
      ...defaultTheme,
      ...(schema.theme || {}),
      colors: {
        ...defaultTheme.colors,
        ...(schema.theme?.colors || {})
      }
    };

    function px(v) {
      return typeof v === "number" ? v + "px" : v;
    }

    function normalizeStyle(style = {}) {
      return {
        ...style,
        margin: px(style.margin),
        marginTop: px(style.marginTop),
        marginBottom: px(style.marginBottom),
        marginLeft: px(style.marginLeft),
        marginRight: px(style.marginRight),

        padding: px(style.padding),
        paddingTop: px(style.paddingTop),
        paddingBottom: px(style.paddingBottom),
        paddingLeft: px(style.paddingLeft),
        paddingRight: px(style.paddingRight),

        borderRadius: px(style.borderRadius),
        fontSize: px(style.fontSize),
      };
    }

    function render() {
      const root = document.getElementById("app");
      root.innerHTML = "";

      const screen = schema.screens.find(s => s.id === currentScreenId);
      if (!screen) return;

      const screenEl = document.createElement("div");
      screenEl.className = "screen";
      screenEl.style.background = theme.colors.background;
      screenEl.style.color = theme.colors.text;
      screenEl.style.fontFamily = theme.font;

      const title = document.createElement("h2");
      title.textContent = screen.name;
      title.style.marginBottom = theme.spacing * 2 + "px";
      screenEl.appendChild(title);

      screen.components.forEach(c => renderComponent(c, screenEl));

      root.appendChild(screenEl);
    }

    function renderComponent(component, parent) {
      const { type, props = {}, style = {}, children = [] } = component;
      let el;

      const userStyle = normalizeStyle(style);

      switch (type) {
        case "Text":
          el = document.createElement("p");
          el.textContent = props.text;
          el.style.margin = theme.spacing + "px 0";
          break;

        case "Button":
          el = document.createElement("button");
          el.textContent = props.label;
          el.style.background = theme.colors.primary;
          el.style.color = "#fff";
          el.style.padding = theme.spacing + "px " + theme.spacing * 2 + "px";
          el.style.borderRadius = theme.radius + "px";
          el.style.margin = theme.spacing + "px 0";
          el.onclick = () => {
            if (props.action?.type === "navigate") {
              currentScreenId = props.action.targetScreenId;
              render();
            }
          };
          break;

        case "Image":
          el = document.createElement("img");
          el.src = props.src;
          el.style.borderRadius = theme.radius + "px";
          el.style.margin = theme.spacing + "px 0";
          break;

        case "Spacer":
          el = document.createElement("div");
          el.style.height = props.height + "px";
          break;

        case "List":
          el = document.createElement("ul");
          el.style.paddingLeft = theme.spacing * 2 + "px";
          props.items.forEach(i => {
            const li = document.createElement("li");
            li.textContent = i;
            el.appendChild(li);
          });
          break;

        case "Container":
          el = document.createElement("div");
          el.style.background = theme.colors.surface;
          el.style.border = "1px solid " + theme.colors.border;
          el.style.borderRadius = theme.radius + "px";
          el.style.padding = theme.spacing + "px";
          el.style.margin = theme.spacing + "px 0";
          children.forEach(child => renderComponent(child, el));
          break;

        default:
          return;
      }

      Object.assign(el.style, userStyle);
      parent.appendChild(el);
    }

    render();
  </script>
</body>
</html>
`;

    // 2. manifest.json
    const manifest = {
      name: "My AI App",
      short_name: "AI App",
      start_url: ".",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#6200ee",
      icons: [
        { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    };

    // 3. Service Worker
    zip.file(
      "sw.js",
      `
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("cache").then(cache =>
      cache.addAll(["./published-app.html", "./manifest.json"])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
`,
    );

    // Add files to zip
    zip.file("index.html", html);
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    // zip.file("sw.js", sw);

    // Placeholder icons (replace with real images later)
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "published-app.zip";
    a.click();
    URL.revokeObjectURL(url);
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

  const componentIndex = currentScreen?.components.findIndex(
    (c) => c.id === selectedComponentId,
  );

  const totalComponents = currentScreen?.components.length;

  // const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mode, setMode] = useState("builder");
  // builder | preview | publish
  const [zoom, setZoom] = useState(1);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  function onMouseDown(e) {
    if (e.button !== 1 && !e.spaceKey) return; // middle mouse or space+drag
    setIsPanning(true);
    panStart.current = {
      x: e.clientX - canvasPos.x,
      y: e.clientY - canvasPos.y,
    };
  }

  function onMouseMove(e) {
    if (!isPanning) return;
    setCanvasPos({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  }

  function onMouseUp() {
    setIsPanning(false);
  }

  useEffect(() => {
    function handleWheel(e) {
      if (!e.ctrlKey) return;
      e.preventDefault();

      setCanvasZoom((z) => {
        const next = z - e.deltaY * 0.001;
        return Math.min(3, Math.max(0.3, next));
      });
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <>
      <div
        style={{
          height: 48,
          background: "#1e1e1e",
          borderBottom: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          color: "#ddd",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 600 }}>AI App Builder</div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            style={style.toolButton(mode === "builder")}
            onClick={() => setMode("builder")}
          >
            Design
          </button>
          <button
            style={style.toolButton(mode === "preview")}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
          <button
            style={style.toolButton(mode === "publish")}
            onClick={() => setMode("publish")}
          >
            Publish
          </button>

          {mode === "publish" && (
            <button
              onClick={exportPublishHTML}
              style={{
                background: style.colors.primary,
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Export HTML
            </button>
          )}

          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            −
          </button>
          <span style={{ fontSize: 12 }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            +
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 48px)",
          background: style.colors.bgDark,
          color: style.colors.textLight,
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Screen Switcher */}
        {/* Unified Left Panel (Figma style) */}
        <div
          style={{
            width: 260,
            background: style.colors.panelDark,
            borderRight: `1px solid ${style.colors.border}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${style.colors.border}`,
            }}
          >
            <button
              onClick={() => setLeftTab("screens")}
              style={{
                flex: 1,
                ...style.toolButton(leftTab === "screens"),
                borderRadius: 0,
              }}
            >
              Screens
            </button>
            <button
              onClick={() => setLeftTab("layers")}
              style={{
                flex: 1,
                ...style.toolButton(leftTab === "layers"),
                borderRadius: 0,
              }}
            >
              Layers
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: 10,
            }}
          >
            {leftTab === "screens" && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => importSchema(e.target.files[0])}
                  />
                </div>

                <button
                  onClick={resetProject}
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    background: "#ff4d4d",
                    color: "#fff",
                    border: "none",
                    padding: "6px",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Reset Project
                </button>

                {screens.map((screen) => (
                  <div
                    key={screen.id}
                    onClick={() => {
                      setCurrentScreenId(screen.id);
                      setSelectedComponentId(null);
                      setLeftTab("layers");
                    }}
                    style={{
                      padding: "8px 10px",
                      marginBottom: 6,
                      borderRadius: 6,
                      cursor: "pointer",
                      background:
                        currentScreenId === screen.id
                          ? style.colors.primary
                          : "transparent",
                      color: "#fff",
                      fontSize: 13,
                      overflowX: "hidden",
                      // scrollBehavior: "smooth"
                    }}
                  >
                    <MdOutlineSplitscreen /> {screen.name}
                  </div>
                ))}
                <ThemeSelector
                  currentTheme={schema.theme}
                  onChange={(theme) => {
                    setSchema((prev) => ({
                      ...prev,
                      theme,
                    }));
                  }}
                />
              </>
            )}

            {leftTab === "layers" && (
              <>
                <div
                  style={{
                    fontSize: 12,
                    color: style.colors.textMuted,
                    marginBottom: 6,
                  }}
                >
                  Layers – {currentScreen.name}
                </div>

                <ComponentTree
                  components={currentScreen.components}
                  selectedId={selectedComponentId}
                  onSelect={setSelectedComponentId}
                />
              </>
            )}
          </div>
        </div>

        {/* App Preview  */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            position: "relative",
            cursor: isPanning ? "grabbing" : "default",
            userSelect: isPanning ? "none" : "auto",
            ...style.canvasGrid,
          }}
          onClick={() => setSelectedComponentId(null)}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Camera */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `
                translate(${canvasPos.x}px, ${canvasPos.y}px)
                translate(-50%, -50%)
                scale(${canvasZoom})
             `,
              transformOrigin: "center center",
              transition: isPanning
                ? "none"
                : "transform 0.08s cubic-bezier(.22,.61,.36,1)",
              zIndex: 2,
            }}
          >
            <div
              style={{
                background: "#111",
                borderRadius: 24,
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                padding: 12,
              }}
            >
              <div
                style={{
                  width: 360,
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "visible",
                  position: "relative",
                }}
              >
                <div style={{}}>
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
            </div>
          </div>
        </div>

        {/* Property Panel */}

        {mode !== "publish" && (
          <div
            style={{
              width: 300,
              borderLeft: `1px solid ${style.colors.border}`,
              padding: 12,
              background: style.colors.panelDark,
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
      </div>

      {mode === "builder" && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e1e1e",
            border: "1px solid #333",
            borderRadius: 12,
            padding: "8px 12px",
            display: "flex",
            gap: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 9999,
          }}
        >
          {["Text", "Button", "Image", "Spacer", "List", "Container"].map(
            (type) => {
              const disabled =
                selectedComponent && selectedComponent.type !== "Container";

              return (
                <button
                  key={type}
                  onClick={() => addComponent(type)}
                  disabled={disabled}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    borderRadius: 6,
                    background: disabled ? "#333" : "#6200ee",
                    color: "#fff",
                    border: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.4 : 1,
                    transition: "0.15s",
                  }}
                >
                  + {type}
                </button>
              );
            },
          )}
        </div>
      )}
    </>
  );
};

export default editorPage;
