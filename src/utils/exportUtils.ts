import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { PageData } from "../types";

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
export const renderPageForExport = async (pageData: PageData): Promise<string> => {
  const tempDiv = document.createElement("div");
  Object.assign(tempDiv.style, {
    width: "794px",
    height: "1123px",
    position: "absolute",
    left: "-9999px",
    background: safeColor(pageData.backgroundColor),
    padding: "16px",
    boxSizing: "border-box",
  });

  const layoutData = JSON.parse(pageData.layout);
  Object.assign(tempDiv.style, {
    display: "grid",
    gridTemplateRows: layoutData.cells.map(() => "1fr").join(" "),
    gridTemplateAreas: layoutData.cells
      .map((row: string[]) => `"${row.map((cell: string) => cell.toLowerCase()).join(" ")}"`)
      .join(" "),
    gap: "0.5rem",
  });

  // Create grid cells
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
      position: "relative",
    });
    cellDiv.id = `export-${cell}`;
    tempDiv.appendChild(cellDiv);
    cellDivs[cell] = cellDiv;
  });

  // Elements
  const elementsToRender = pageData.elements.map((el) => ({
    ...el,
    container: cellDivs[el.containerId],
  }));

  elementsToRender.forEach((el) => {
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
      canvas.width = el.width;
      canvas.height = el.height;
      elDiv.style.padding = "4px";
      elDiv.appendChild(canvas);

      const chartType = el.data?.chartType;
      const chartData = el.data?.chartData;

      if ((window)?.Chart) {
        new (window).Chart(canvas, {
          type: chartType,
          data: chartData,
          options: {
            maintainAspectRatio: false,
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
      } else {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Chart", canvas.width / 2, canvas.height / 2);
        }
      }
    } else if (el.type === "text" || el.type === "header") {
      const tag = el.type === "header" ? (el.data?.headerSize || "h1") : "p";
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
      const tableData: string[][] =
        el.data?.table || [
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
      tableData.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
          const td = document.createElement("td");
          Object.assign(td.style, {
            border: "1px solid #e5e7eb",
            padding: "2px",
            textAlign: "left",
          });
          td.textContent = cell;
          tr.appendChild(td);
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

    el.container?.appendChild(elDiv);
  });

  document.body.appendChild(tempDiv);

  try {
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
          if (style.backgroundColor) node.style.backgroundColor = safeColor(style.backgroundColor);
          if (style.borderColor) node.style.borderColor = safeColor(style.borderColor);
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
