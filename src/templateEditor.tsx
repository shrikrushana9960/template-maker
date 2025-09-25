import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

type ElementType = "text" | "image" | "table" | "chart";

interface ElementData {
  id: string;
  type: ElementType;
  containerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: any;
}

interface PageData {
  layout: string;
  elements: ElementData[];
  backgroundColor: string;
  gridColor: string;
}

const DEFAULT_LAYOUT = '{"cells": [["A", "B", "C"]]}';
const DEFAULT_PAGE_COLOR = "#f3f4f6";
const DEFAULT_GRID_COLOR = "#ffffff";

const PdfTemplateEditor: React.FC = () => {
  const editorPageRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageData[]>([
    {
      layout: DEFAULT_LAYOUT,
      elements: [],
      backgroundColor: DEFAULT_PAGE_COLOR,
      gridColor: DEFAULT_GRID_COLOR,
    },
  ]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);
  const [activeElement, setActiveElement] = useState<ElementData | null>(null);

  // --- Add Element ---
  const addElement = (type: ElementType, chartType?: string) => {
    if (!activeContainer) {
      alert("Please select a cell to add an element.");
      return;
    }
    const id = Math.random().toString(36).substring(2, 9);
    const newElement: ElementData = {
      id,
      type,
      containerId: activeContainer,
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      data: {
        ...(type === "text" && { text: "Placeholder Text" }),
        ...(type === "image" && { src: "" }),
        ...(type === "table" && {
          table: [
            ["Header 1", "Header 2", "Header 3"],
            ["Data 1", "Data 2", "Data 3"],
          ],
        }),
        ...(type === "chart" && {
          chartType,
          chartData: {
            labels: ["A", "B", "C"],
            datasets: [
              {
                label: "Sample",
                data: [10, 20, 30],
                backgroundColor: "#8b5cf6",
              },
            ],
          },
        }),
      },
    };

    setPages((prev) => {
      const newPages = [...prev];
      newPages[currentPage].elements.push(newElement);
      return newPages;
    });
  };

  // --- Export as PDF ---
  const exportPdf = async () => {
    const doc = new jsPDF({ unit: "px", format: "a4", hotfixes: ["px_scaling"] });
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage();
      if (editorPageRef.current) {
        const canvas = await html2canvas(editorPageRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(
          imgData,
          "PNG",
          0,
          0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );
      }
    }
    doc.save("template.pdf");
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gray-200 font-inter">
      <div className="bg-white max-w-7xl w-full rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">PDF Template Editor</h1>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              onClick={exportPdf}
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 space-y-2">
            <h2 className="text-sm font-bold text-gray-800 mb-2">Components</h2>
            <button
              className="w-full px-3 py-1.5 text-sm text-white bg-blue-500 rounded-md"
              onClick={() => addElement("text")}
            >
              Add Text
            </button>
            <button
              className="w-full px-3 py-1.5 text-sm text-white bg-green-500 rounded-md"
              onClick={() => addElement("image")}
            >
              Add Image
            </button>
            <button
              className="w-full px-3 py-1.5 text-sm text-white bg-purple-500 rounded-md"
              onClick={() => addElement("chart", "bar")}
            >
              Add Chart
            </button>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 p-4">
            <div
              ref={editorPageRef}
              className="editor-page-container rounded-lg p-4 bg-gray-100 min-h-[800px]"
            >
              {/* Cells / Layout */}
              <div className="grid grid-cols-3 gap-2">
                {["A", "B", "C"].map((cell) => (
                  <div
                    key={cell}
                    className={`dashboard-item ${
                      activeContainer === cell ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setActiveContainer(cell)}
                  >
                    {pages[currentPage].elements
                      .filter((el) => el.containerId === cell)
                      .map((el) => (
                        <div
                          key={el.id}
                          className="border border-dashed border-gray-400 p-2 rounded-md bg-white"
                        >
                          {el.type === "text" && (
                            <textarea
                              className="w-full text-sm"
                              value={el.data.text}
                              onChange={(e) =>
                                setPages((prev) => {
                                  const newPages = [...prev];
                                  const idx = newPages[
                                    currentPage
                                  ].elements.findIndex((x) => x.id === el.id);
                                  newPages[currentPage].elements[idx].data.text =
                                    e.target.value;
                                  return newPages;
                                })
                              }
                            />
                          )}
                          {el.type === "image" && (
                            <div className="text-gray-400 text-xs">
                              [Image Placeholder]
                            </div>
                          )}
                          {el.type === "chart" && (
                            <div className="text-gray-400 text-xs">
                              [Chart Placeholder]
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-64 border-l border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Panel</h2>
            <p className="text-sm text-gray-600">
              {activeElement
                ? `Editing ${activeElement.type}`
                : "Select an element to view its settings."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfTemplateEditor;
