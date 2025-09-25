import React, { useState } from "react";
import type { ElementData, PageData } from "../types";

interface RightPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeElement: ElementData | null;
  currentPage: PageData;
  onPageUpdate: (updates: Partial<PageData>) => void;
  onElementUpdate: (id: string, updates: Partial<ElementData>) => void;
  onElementDelete: (id: string) => void;
  onLayoutChange: (layout: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  activeTab,
  onTabChange,
  activeElement,
  currentPage,
  onPageUpdate,
  onElementUpdate,
  onElementDelete,
  onLayoutChange,
}) => {
  const [localElement, setLocalElement] = useState(activeElement);

  React.useEffect(() => {
    setLocalElement(activeElement);
  }, [activeElement]);

  const tabs = [
    { id: "layout", label: "Layout" },
    { id: "layers", label: "Layers" },
    { id: "settings", label: "Settings" },
    { id: "server", label: "Local Server" },
  ];

  const layouts = [
    {
      id: "layout1",
      name: "Two Columns",
      layout: JSON.stringify({ cells: [["A", "B"]] }),
    },
    {
      id: "layout2",
      name: "Three Columns",
      layout: JSON.stringify({ cells: [["A", "B", "C"]] }),
    },
    {
      id: "layout3",
      name: "Two Rows",
      layout: JSON.stringify({ cells: [["A"], ["B"]] }),
    },
    {
      id: "layout4",
      name: "Grid 2x2",
      layout: JSON.stringify({
        cells: [
          ["A", "B"],
          ["C", "D"],
        ],
      }),
    },
  ];

  const handleElementUpdate = (updates: Partial<ElementData>) => {
    if (localElement) {
      const updatedElement = { ...localElement, ...updates };
      setLocalElement(updatedElement);
      onElementUpdate(localElement.id, updates);
    }
  };

  const renderLayoutTab = () => (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-700">Page Layout</h3>

      <div className="grid grid-cols-2 gap-2">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            className={`layout-btn-grid ${
              currentPage.layout === layout.layout ? "active" : ""
            }`}
            onClick={() => onLayoutChange(layout.layout)}
          >
            <svg viewBox="0 0 100 60" className="w-full h-12">
              {layout.layout.includes("A") && (
                <rect x="5" y="5" width="40" height="50" className="svg-cell" />
              )}
              {layout.layout.includes("B") && (
                <rect
                  x="55"
                  y="5"
                  width="40"
                  height="50"
                  className="svg-cell"
                />
              )}
              {layout.layout.includes("C") && (
                <rect
                  x="5"
                  y="30"
                  width="40"
                  height="25"
                  className="svg-cell"
                />
              )}
              {layout.layout.includes("D") && (
                <rect
                  x="55"
                  y="30"
                  width="40"
                  height="25"
                  className="svg-cell"
                />
              )}
            </svg>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Background Color
        </label>
        <input
          type="color"
          value={currentPage.backgroundColor}
          onChange={(e) => onPageUpdate({ backgroundColor: e.target.value })}
          className="w-full h-8 rounded border border-gray-300"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Grid Color</label>
        <input
          type="color"
          value={currentPage.gridColor}
          onChange={(e) => onPageUpdate({ gridColor: e.target.value })}
          className="w-full h-8 rounded border border-gray-300"
        />
      </div>
    </div>
  );

  const renderLayersTab = () => (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-gray-700">Elements</h3>
      {currentPage.elements.map((element) => (
        <div
          key={element.id}
          className={`p-2 border rounded cursor-pointer ${
            activeElement?.id === element.id
              ? "bg-blue-100 border-blue-500"
              : "border-gray-200"
          }`}
          onClick={() => onTabChange("settings")}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium capitalize">
              {element.type}
            </span>
            <span className="text-xs text-gray-500">
              ID: {element.id.slice(0, 6)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettingsTab = () => {
    if (!localElement) {
      return (
        <div className="p-4 text-center text-gray-500">
          Select an element to edit its properties
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700 capitalize">
            {localElement.type} Settings
          </h3>
          <button
            onClick={() => onElementDelete(localElement.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium text-gray-700">X</label>
            <input
              type="number"
              value={localElement.x}
              onChange={(e) =>
                handleElementUpdate({ x: parseInt(e.target.value) || 0 })
              }
              className="w-full p-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Y</label>
            <input
              type="number"
              value={localElement.y}
              onChange={(e) =>
                handleElementUpdate({ y: parseInt(e.target.value) || 0 })
              }
              className="w-full p-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Width</label>
            <input
              type="number"
              value={localElement.width}
              onChange={(e) =>
                handleElementUpdate({ width: parseInt(e.target.value) || 0 })
              }
              className="w-full p-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Height</label>
            <input
              type="number"
              value={localElement.height}
              onChange={(e) =>
                handleElementUpdate({ height: parseInt(e.target.value) || 0 })
              }
              className="w-full p-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {(localElement.type === "text" || localElement.type === "header") && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Text</label>
              <textarea
                value={localElement.data.text || ""}
                onChange={(e) =>
                  handleElementUpdate({
                    data: { ...localElement.data, text: e.target.value },
                  })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={localElement.data.color || "#000000"}
                onChange={(e) =>
                  handleElementUpdate({
                    data: { ...localElement.data, color: e.target.value },
                  })
                }
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Font Size
              </label>
              <input
                type="text"
                value={localElement.data.fontSize || "14px"}
                onChange={(e) =>
                  handleElementUpdate({
                    data: { ...localElement.data, fontSize: e.target.value },
                  })
                }
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localElement.data.isBold || false}
                  onChange={(e) =>
                    handleElementUpdate({
                      data: { ...localElement.data, isBold: e.target.checked },
                    })
                  }
                  className="mr-1"
                />
                <span className="text-sm">Bold</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localElement.data.isItalic || false}
                  onChange={(e) =>
                    handleElementUpdate({
                      data: {
                        ...localElement.data,
                        isItalic: e.target.checked,
                      },
                    })
                  }
                  className="mr-1"
                />
                <span className="text-sm">Italic</span>
              </label>
            </div>

            {localElement.type === "header" && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Header Size
                </label>
                <select
                  value={localElement.data.headerSize || "h1"}
                  onChange={(e) =>
                    handleElementUpdate({
                      data: {
                        ...localElement.data,
                        headerSize: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                >
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
              </div>
            )}
          </>
        )}
        {localElement.type === "table" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Table Data
              </label>
              <div className="space-y-2">
                {(localElement.data.table || []).map(
                  (row: string[], rowIndex: number) => (
                    <div key={rowIndex} className="flex space-x-2">
                      {row.map((cell: string, colIndex: number) => (
                        <input
                          key={colIndex}
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newTable = [
                              ...(localElement.data.table || []),
                            ];
                            newTable[rowIndex][colIndex] = e.target.value;
                            handleElementUpdate({
                              data: { ...localElement.data, table: newTable },
                            });
                          }}
                          className="flex-1 p-1 border border-gray-300 rounded text-sm"
                        />
                      ))}
                      {/* Add column button */}
                      {rowIndex === 0 && (
                        <button
                          onClick={() => {
                            const newTable = (
                              localElement.data.table || []
                            ).map((r: string[]) => [...r, ""]);
                            handleElementUpdate({
                              data: { ...localElement.data, table: newTable },
                            });
                          }}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                        >
                          + Col
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const newTable = [
                    ...(localElement.data.table || []),
                    new Array(localElement.data.table?.[0]?.length || 1).fill(
                      ""
                    ),
                  ];
                  handleElementUpdate({
                    data: { ...localElement.data, table: newTable },
                  });
                }}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
              >
                + Row
              </button>
              <button
                onClick={() => {
                  const newTable = [...(localElement.data.table || [])];
                  newTable.pop();
                  handleElementUpdate({
                    data: { ...localElement.data, table: newTable },
                  });
                }}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                disabled={(localElement.data.table || []).length <= 1}
              >
                - Row
              </button>
            </div>
          </div>
        )}

        {localElement.type === "chart" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Chart Type
              </label>
              <select
                value={localElement.data.chartType || "bar"}
                onChange={(e) =>
                  handleElementUpdate({
                    data: { ...localElement.data, chartType: e.target.value },
                  })
                }
                className="w-full p-1 border border-gray-300 rounded text-sm"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
                <option value="radar">Radar</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Labels (comma separated)
              </label>
              <input
                type="text"
                value={(localElement.data.labels || []).join(", ")}
                onChange={(e) =>
                  handleElementUpdate({
                    data: {
                      ...localElement.data,
                      labels: e.target.value.split(",").map((s) => s.trim()),
                    },
                  })
                }
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Dataset Values (comma separated)
              </label>
              <input
                type="text"
                value={(localElement.data.datasets?.[0]?.data || []).join(", ")}
                onChange={(e) => {
                  const values = e.target.value
                    .split(",")
                    .map((s) => parseFloat(s.trim()))
                    .filter((n) => !isNaN(n));
                  handleElementUpdate({
                    data: {
                      ...localElement.data,
                      datasets: [
                        {
                          ...(localElement.data.datasets?.[0] || {}),
                          data: values,
                        },
                      ],
                    },
                  });
                }}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Dataset Label
              </label>
              <input
                type="text"
                value={localElement.data.datasets?.[0]?.label || ""}
                onChange={(e) =>
                  handleElementUpdate({
                    data: {
                      ...localElement.data,
                      datasets: [
                        {
                          ...(localElement.data.datasets?.[0] || {}),
                          label: e.target.value,
                        },
                      ],
                    },
                  })
                }
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Background Color
              </label>
              <input
                type="color"
                value={
                  (localElement.data.datasets?.[0]
                    ?.backgroundColor as string) || "#36A2EB"
                }
                onChange={(e) =>
                  handleElementUpdate({
                    data: {
                      ...localElement.data,
                      datasets: [
                        {
                          ...(localElement.data.datasets?.[0] || {}),
                          backgroundColor: e.target.value,
                        },
                      ],
                    },
                  })
                }
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
          </div>
        )}

        {localElement.type === "image" && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              value={localElement.data.src || ""}
              onChange={(e) =>
                handleElementUpdate({
                  data: { ...localElement.data, src: e.target.value },
                })
              }
              className="w-full p-1 border border-gray-300 rounded text-sm"
              placeholder="Enter image URL or upload file"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    handleElementUpdate({
                      data: {
                        ...localElement.data,
                        src: event.target?.result as string,
                      },
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full mt-2 text-sm"
            />
          </div>
        )}
      </div>
    );
  };

  const renderServerTab = () => (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-700">Local Server</h3>
      <p className="text-sm text-gray-600">
        Server functionality would be implemented here to save/load templates
        from a local server.
      </p>
    </div>
  );

  return (
    <div className="right-panel-container">
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {activeTab === "layout" && renderLayoutTab()}
        {activeTab === "layers" && renderLayersTab()}
        {activeTab === "settings" && renderSettingsTab()}
        {activeTab === "server" && renderServerTab()}
      </div>
    </div>
  );
};

export default RightPanel;
