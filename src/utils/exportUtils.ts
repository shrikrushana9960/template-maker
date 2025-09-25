import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { PageData } from '../types';

// Helper to check for and remove unsupported CSS color functions
const normalizeColor = (color: string | undefined): string => {
  if (!color) return 'white'; // Default fallback
  
  // Regex to check for unsupported color functions (e.g., oklch, lab, color)
  const unsupportedRegex = /^(oklch|lab|color)\s*\(/i;
  
  if (unsupportedRegex.test(color)) {
    // NOTE: In a real-world scenario, you might want to convert the color 
    // using a more complex library. For a simple fix, we'll use a standard fallback.
    // If you know the hex equivalent, you can return it here.
    console.warn(`Unsupported color function detected: ${color}. Falling back to #F8FAFC.`);
    return '#F8FAFC'; // A known, safe color (e.g., slate-50)
  }
  
  return color;
};

export const renderPageForExport = async (pageData: PageData): Promise<string> => {
  const tempDiv = document.createElement('div');
  
  // 1. NORMALIZE BACKGROUND COLOR HERE
  const safeBackgroundColor = normalizeColor(pageData.backgroundColor);
  
  tempDiv.style.width = '794px';
  tempDiv.style.height = '1123px';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.background = safeBackgroundColor; // Use safe color
  tempDiv.style.padding = '16px';
  tempDiv.style.boxSizing = 'border-box';
  
  const layoutData = JSON.parse(pageData.layout);
  tempDiv.style.display = 'grid';
  tempDiv.style.gridTemplateRows = layoutData.cells.map(() => '1fr').join(' ');
  tempDiv.style.gridTemplateAreas = layoutData.cells.map((row:any) => `"${row.map((cell:any) => cell.toLowerCase()).join(' ')}"`).join(' ');
  tempDiv.style.gap = '0.5rem';

  const uniqueCells = [...new Set(layoutData.cells.flat())];
  const cellDivs: { [key: string]: HTMLDivElement } = {};
  
  // 2. NORMALIZE GRID/CELL COLOR HERE
  const safeGridColor = normalizeColor(pageData.gridColor);

  uniqueCells.forEach((cell:any) => {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'dashboard-item-export';
    cellDiv.style.gridArea = cell.toLowerCase();
    cellDiv.id = `export-${cell}`;
    cellDiv.style.backgroundColor = safeGridColor; // Use safe color
    cellDiv.style.border = 'none';
    cellDiv.style.boxShadow = 'none';
    cellDiv.style.minHeight = '200px';
    cellDiv.style.position = 'relative';
    tempDiv.appendChild(cellDiv);
    cellDivs[cell] = cellDiv;
  });

  pageData.elements.forEach(el => {
    const elDiv = document.createElement('div');
    elDiv.style.position = 'absolute';
    elDiv.style.left = `${el.x}px`;
    elDiv.style.top = `${el.y}px`;
    elDiv.style.width = `${el.width}px`;
    elDiv.style.height = `${el.height}px`;
    elDiv.style.borderRadius = '6px';
    elDiv.style.backgroundColor = 'white';
    elDiv.style.boxSizing = 'border-box';
    elDiv.style.padding = '8px';

    if (el.type === 'text' || el.type === 'header') {
      const tag = el.type === 'header' ? (el.data?.headerSize || 'h1') : 'p';
      const textElement = document.createElement(tag);
      textElement.style.fontSize = el.data?.fontSize || '14px';
      textElement.style.fontWeight = el.data?.isBold ? 'bold' : 'normal';
      textElement.style.fontStyle = el.data?.isItalic ? 'italic' : 'normal';
      textElement.style.color = el.data?.color || '#000000';
      textElement.textContent = el.data?.text || '';
      elDiv.style.overflow = 'hidden';
      elDiv.style.wordBreak = 'break-all';
      elDiv.appendChild(textElement);
    } else if (el.type === 'table') {
      elDiv.style.padding = '4px';
      const tableData = el.data?.table || [['Header 1', 'Header 2', 'Header 3'], ['Data 1', 'Data 2', 'Data 3']];
      let tableHtml = `<div style="overflow: auto; width: 100%; height: 100%;"><table style="width: 100%; font-size: 10px; border-collapse: collapse;"><tbody>`;
      tableData.forEach(row => {
        tableHtml += `<tr>`;
        row.forEach(cell => {
          tableHtml += `<td style="border: 1px solid #e5e7eb; padding: 2px;">${cell}</td>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</tbody></table></div>`;
      elDiv.innerHTML = tableHtml;
    } else if (el.type === 'image') {
      elDiv.style.padding = '0';
      if (el.data?.src) {
        elDiv.innerHTML = `<img src="${el.data.src}" style="width: 100%; height: 100%; object-fit: contain;" />`;
      } else {
        elDiv.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">Placeholder Image</div>`;
      }
    }
    
    if (cellDivs[el.containerId]) {
      cellDivs[el.containerId].appendChild(elDiv);
    }
  });
  
  document.body.appendChild(tempDiv);
  console.log(tempDiv)
  
  // You can safely remove this `setTimeout` as html2canvas typically handles this.
  // await new Promise(resolve => setTimeout(resolve, 500)); 
  
  // NOTE: If issues persist, try setting scale: 1 or removing it entirely.
  const canvas = await html2canvas(tempDiv, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  document.body.removeChild(tempDiv);
  return imgData;
};

export const exportAsPdf = async (pages: PageData[]) => {
  // NOTE: The jspdf hotfix is non-standard. It's safe to keep but check documentation 
  // if you upgrade jspdf and run into issues.
  const doc = new jsPDF({ unit: 'px', format: 'a4', hotfixes: ['px_scaling'] as any });
  
  console.log(pages)
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      doc.addPage();
    }
    const imgData = await renderPageForExport(pages[i]);
    doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
  }
  
  doc.save('template.pdf');
};