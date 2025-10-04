import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { PageData } from "../types";
import { Chart } from "chart.js/auto";
/** Convert named/modern color strings to safe hex/rgb/rgba */
const safeColor = (color: string): string => {
  if (!color) return "#000000";

  // Already valid hex/rgb(a)
  if (color.startsWith("#") || color.startsWith("rgb")) return color;

  // Common named colors
  const colorMap: Record<string, string> = {
    transparent: "rgba(0,0,0,0)",
    currentcolor: "#000000",
    black: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    gray: "#808080",
    grey: "#808080",
  };

  return colorMap[color.toLowerCase()] || "#000000";
};

/**
 * Render a single page to a PNG data URL.
 */
export const renderPageForExport = async (
    pageData: PageData
): Promise<string> => {
    // 1. Setup temporary A4-sized container
    const tempDiv = document.createElement("div");
    Object.assign(tempDiv.style, {
        width: "794px", // A4 at 72dpi
        height: "1123px", // A4 at 72dpi
        position: "absolute",
        left: "-9999px",
        background: safeColor(pageData.backgroundColor),
        padding: "16px",
        boxSizing: "border-box",
    });

    // 2. Setup CSS Grid layout
    const layoutData = JSON.parse(pageData.layout);
    Object.assign(tempDiv.style, {
        display: "grid",
        // Map each row to '1fr' to distribute height evenly
        gridTemplateRows: layoutData.cells.map(() => "1fr").join(" "),
        // Map cell IDs to grid-area names
        gridTemplateAreas: layoutData.cells
            .map(
                (row: string[]) =>
                    `"${row.map((cell: string) => cell.toLowerCase()).join(" ")}"`
            )
            .join(" "),
        gap: "0.5rem",
    });

    // 3. Create grid cells and map them to IDs
    const uniqueCells = [...new Set(layoutData.cells.flat())];
    const cellDivs: Record<string, HTMLDivElement> = {};

    uniqueCells.forEach((cell: string) => {
        const cellDiv = document.createElement("div");
        Object.assign(cellDiv.style, {
            gridArea: cell.toLowerCase(),
            backgroundColor: safeColor(pageData.gridColor),
            border: "none",
            boxShadow: "none",
            minHeight: "200px",
            position: "relative", // Crucial for positioning elements inside
        });
        cellDiv.id = `export-${cell}`;
        tempDiv.appendChild(cellDiv);
        cellDivs[cell] = cellDiv;
    });

    // 4. Map elements to their container DOM nodes
    const elementsToRender = pageData.elements.map((el) => ({
        ...el,
        container: cellDivs[el.containerId],
    }));

    // 5. Render elements into their grid cells
    for (const el of elementsToRender) {
        if (!el.container) continue;

        const elDiv = document.createElement("div");
        Object.assign(elDiv.style, {
            position: "absolute",
            left: `${el.x}px`,
            top: `${el.y}px`,
            width: `${el.width}px`,
            height: `${el.height}px`,
            borderRadius: "6px",
            backgroundColor: "white",
            boxSizing: "border-box",
            padding: "8px",
            border: "1px solid #e5e7eb",
        });

        // Handle different element types
        if (el.type === "chart") {
            const canvas = document.createElement("canvas");
            // Set canvas dimensions to match the element div for Chart.js
            canvas.width = el.width;
            canvas.height = el.height;
            elDiv.style.padding = "4px";
            elDiv.appendChild(canvas);

            const chartType = el.data?.chartType;
            console.log({...el.data})
            const chartData = {
                labels: el.data?.labels || ["A", "B", "C", "D"],
                datasets: [
                    {
                        label: el.data?.datasets?.[0]?.label || "Dataset",
                        data: el.data?.datasets?.[0]?.data || [10, 20, 30, 40],
                        backgroundColor: el.data?.datasets?.[0]?.backgroundColor || [
                            "rgba(75,192,192,0.6)",
                            "rgba(255,99,132,0.6)",
                            "rgba(255,206,86,0.6)",
                            "rgba(54,162,235,0.6)",
                        ],
                        borderColor: "rgba(0,0,0,0.8)",
                        borderWidth: 1,
                    },
                ],
            };


            new Chart(canvas, {
                type: chartType as any, 
                data: chartData, 
                options: {
                     animation: false,
                    maintainAspectRatio: false,
                    responsive: false, 
                    plugins: { legend: { display: true } },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            grid: {
                                display: true,
                                drawBorder: false,
                                color: "#e5e7eb",
                                borderDash: [5, 5],
                            },
                        },
                    },
                },
            });
        } else if (el.type === "text" || el.type === "header") {
            const tag = el.type === "header" ? el.data?.headerSize || "h1" : "p";
            const textElement = document.createElement(tag);
            Object.assign(textElement.style, {
                fontSize: el.data?.fontSize || "14px",
                fontWeight: el.data?.isBold ? "bold" : "normal",
                fontStyle: el.data?.isItalic ? "italic" : "normal",
                color: safeColor(el.data?.color || "#000000"),
                margin: "0",
                padding: "0",
                lineHeight: "1.4",
            });
            textElement.textContent = el.data?.text || "";
            elDiv.style.overflow = "hidden";
            elDiv.style.wordBreak = "break-all";
            elDiv.appendChild(textElement);
        } else if (el.type === "table") {
            elDiv.style.padding = "4px";
            const tableData: string[][] = el.data?.table || [
                ["Header 1", "Header 2", "Header 3"],
                ["Data 1", "Data 2", "Data 3"],
            ];

            const tableContainer = document.createElement("div");
            Object.assign(tableContainer.style, {
                overflow: "auto",
                width: "100%",
                height: "100%",
            });

            const table = document.createElement("table");
            Object.assign(table.style, {
                width: "100%",
                fontSize: "10px",
                borderCollapse: "collapse",
                border: "1px solid #e5e7eb",
            });

            const tableBody = document.createElement("tbody");
            tableData.forEach((row, rowIndex) => {
                const tr = document.createElement("tr");
                row.forEach((cell) => {
                    const cellTag = rowIndex === 0 ? 'th' : 'td'; // Use th for header row
                    const cellElement = document.createElement(cellTag);
                    Object.assign(cellElement.style, {
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "left",
                        fontWeight: rowIndex === 0 ? 'bold' : 'normal',
                        backgroundColor: rowIndex === 0 ? '#f3f4f6' : 'white'
                    });
                    cellElement.textContent = cell;
                    tr.appendChild(cellElement);
                });
                tableBody.appendChild(tr);
            });

            table.appendChild(tableBody);
            tableContainer.appendChild(table);
            elDiv.appendChild(tableContainer);
        } else if (el.type === "image") {
            elDiv.style.padding = "0";
            if (el.data?.src) {
                const img = document.createElement("img");
                Object.assign(img.style, {
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                });
                img.src = el.data.src;
                elDiv.appendChild(img);
            } else {
                const placeholder = document.createElement("div");
                Object.assign(placeholder.style, {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: "12px",
                    border: "2px dashed #d1d5db",
                });
                placeholder.textContent = "Placeholder Image";
                elDiv.appendChild(placeholder);
            }
        }

        el.container.appendChild(elDiv);
    }

    document.body.appendChild(tempDiv);

    try {
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        const canvas = await html2canvas(tempDiv, {
            scale: 2, 
            useCORS: true,
            allowTaint: false,
            backgroundColor: safeColor(pageData.backgroundColor),
            logging: false,
            onclone: (clonedDoc) => {
                clonedDoc.querySelectorAll<HTMLElement>("*").forEach((node) => {
                    const style = window.getComputedStyle(node);
                    if (style.color) node.style.color = safeColor(style.color);
                    if (style.backgroundColor)
                        node.style.backgroundColor = safeColor(style.backgroundColor);
                    if (style.borderColor)
                        node.style.borderColor = safeColor(style.borderColor);
                });
            },
        });

        const imgData = canvas.toDataURL("image/png");
        document.body.removeChild(tempDiv);
        return imgData;
    } catch (error) {
        console.error("Error rendering page for export:", error);
        document.body.removeChild(tempDiv);
        throw error;
    }
};

/**
 * Export multiple pages as a single PDF.
 */
export const exportAsPdf = async (pages: PageData[]): Promise<void> => {
  const doc = new jsPDF({
    unit: "px",
    format: "a4",
    // `hotfixes` is not typed in the latest @types/jspdf, so we cast.
    hotfixes: ["px_scaling"] as unknown as string[],
  });

  try {
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage();
      const imgData = await renderPageForExport(pages[i]);
      doc.addImage(
        imgData,
        "PNG",
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight(),
        undefined,
        "FAST"
      );
    }
    doc.save("template.pdf");
  } catch (err) {
    console.error("PDF export error:", err);
    throw new Error("Failed to export PDF. Please try again.");
  }
};