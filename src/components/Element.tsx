import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";
import type { ElementData } from "../types";
import Delete from "../assets/delete.svg";
interface ElementProps {
  element: ElementData;
  onMouseDown: (e: React.MouseEvent, element: ElementData) => void;
  onUpdate: (id: string, updates: Partial<ElementData>) => void;
  onDelete: (id: string) => void;
}

const Element: React.FC<ElementProps> = ({
  element,
  onMouseDown,
  onUpdate,
  onDelete,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (element.type === "chart" && chartRef.current) {
      // Destroy previous instance to prevent duplicate canvas rendering
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: element.data.chartType || "bar",
        data: {
          labels: element.data.labels || [],
          datasets: [
            {
              // FIX: Read data from the 'datasets' array with fallbacks
              label: element.data.datasets?.[0]?.label || "",
              data: element.data.datasets?.[0]?.data || [],
              backgroundColor: element.data.datasets?.[0]?.backgroundColor || [
                "rgba(75,192,192,0.6)",
                "rgba(255,99,132,0.6)",
                "rgba(255,206,86,0.6)",
                "rgba(54,162,235,0.6)",
              ],
              borderColor: "rgba(0,0,0,0.8)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [element]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }
    onMouseDown(e, element);
  };

  const renderContent = () => {
    switch (element.type) {
      case "text":
        return (
          <textarea
            className="w-full h-full text-sm resize-none bg-transparent outline-none p-1"
            value={element.data.text}
            onChange={(e) =>
              onUpdate(element.id, {
                data: { ...element.data, text: e.target.value },
              })
            }
            style={{
              color: element.data.color,
              fontSize: element.data.fontSize,
              fontWeight: element.data.isBold ? "bold" : "normal",
              fontStyle: element.data.isItalic ? "italic" : "normal",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
        );

      case "image":
        if (element.data.src) {
          return (
            <img
              src={element.data.src}
              className="w-full h-full object-contain"
              alt=""
              onMouseDown={(e) => e.stopPropagation()}
            />
          );
        }
        return (
          <label className="w-full h-full flex items-center justify-center border-2 border-gray-300 border-dashed text-gray-500 text-xs cursor-pointer rounded-md">
            Placeholder Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    onUpdate(element.id, {
                      data: {
                        ...element.data,
                        src: event.target?.result as string,
                      },
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </label>
        );

      case "table":
        const tableData = element.data.table || [
          ["Header 1", "Header 2", "Header 3"],
          ["Data 1", "Data 2", "Data 3"],
        ];
        return (
          <div className="p-1 overflow-auto w-full h-full">
            <table className="w-full text-xs">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="border border-gray-300 p-0.5"
                      >
                        <input
                          type="text"
                          value={cell}
                          className="w-full bg-transparent text-xs outline-none focus:bg-gray-100"
                          onChange={(e) => {
                            const newTableData = [...tableData];
                            newTableData[rowIndex][colIndex] = e.target.value;
                            onUpdate(element.id, {
                              data: { ...element.data, table: newTableData },
                            });
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "chart":
        return (
          <canvas
            ref={chartRef}
            className="w-full h-full"
            // onMouseDown={(e) => e.stopPropagation()}
          />
        );

      default:
        return null;
    }
  };
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(element.id);
  };
  const resizeHandles = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "top-center",
    "bottom-center",
    "left-center",
    "right-center",
  ];

  return (
    <div
      className="element-container"
      data-id={element.id}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
      //
      onMouseDown={handleMouseDown}
    >
      <div onMouseDown={handleMouseDown} className="element-id-label">
        ID: {element.id.slice(0, 6)}
      </div>
      <button
        onClick={handleDeleteClick}
      className="element-id-delete opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-1 right-1 bg-white rounded-full shadow p-1"
        title="Delete Element"
        style={{
          width: "20px",
          height: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={Delete} alt="Export PDF" className="w-3 h-6" />
      </button>
      {resizeHandles.map((direction) => (
        <div
          key={direction}
          className={`resize-handle ${direction}`}
          data-direction={direction}
        />
      ))}

      <div
        onMouseDown={handleMouseDown}
        ref={contentRef}
        className="w-full h-full overflow-hidden"
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default Element;
