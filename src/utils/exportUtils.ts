import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { PageData } from '../types';

// Function to convert modern color formats to hex/rgb
const safeColor = (color: string): string => {
  if (!color) return '#000000';
  
  // If it's already a hex or rgb color, return as is
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color;
  }
  
  // Convert named colors to hex
  const colorMap: { [key: string]: string } = {
    'transparent': 'rgba(0,0,0,0)',
    'currentColor': '#000000',
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#00ff00',
    'blue': '#0000ff',
    'gray': '#808080',
    'grey': '#808080',
  };
  
  return colorMap[color.toLowerCase()] || '#000000';
};

export const renderPageForExport = async (pageData: PageData): Promise<string> => {
  const tempDiv = document.createElement('div');
  tempDiv.style.width = '794px';
  tempDiv.style.height = '1123px';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.background = safeColor(pageData.backgroundColor);
  tempDiv.style.padding = '16px';
  tempDiv.style.boxSizing = 'border-box';
  
  const layoutData = JSON.parse(pageData.layout);
  tempDiv.style.display = 'grid';
  tempDiv.style.gridTemplateRows = layoutData.cells.map(() => '1fr').join(' ');
  tempDiv.style.gridTemplateAreas = layoutData.cells.map(row => `"${row.map(cell => cell.toLowerCase()).join(' ')}"`).join(' ');
  tempDiv.style.gap = '0.5rem';

  const uniqueCells = [...new Set(layoutData.cells.flat())];
  const cellDivs: { [key: string]: HTMLDivElement } = {};

  uniqueCells.forEach(cell => {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'dashboard-item-export';
    cellDiv.style.gridArea = cell.toLowerCase();
    cellDiv.id = `export-${cell}`;
    cellDiv.style.backgroundColor = safeColor(pageData.gridColor);
    cellDiv.style.border = 'none';
    cellDiv.style.boxShadow = 'none';
    cellDiv.style.minHeight = '200px';
    cellDiv.style.position = 'relative';
    tempDiv.appendChild(cellDiv);
    cellDivs[cell] = cellDiv;
  });

  const elementsToRender = pageData.elements.map(el => {
    return {
      ...el,
      container: cellDivs[el.containerId]
    };
  });

  elementsToRender.forEach(el => {
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
    elDiv.style.border = '1px solid #e5e7eb'; // Add border for visibility

    if (el.type === 'chart') {
      const canvas = document.createElement('canvas');
      canvas.width = el.width;
      canvas.height = el.height;
      elDiv.style.padding = '4px';
      elDiv.appendChild(canvas);
      
      const chartType = el.data?.chartType;
      const chartData = el.data?.chartData;

      // Use Chart.js if available, otherwise create a simple placeholder
      if (window.Chart) {
        new Chart(canvas, {
          type: chartType,
          data: chartData,
          options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: {
              x: { grid: { display: false } },
              y: { grid: { display: true, drawBorder: false, color: '#e5e7eb', borderDash: [5, 5] } }
            }
          }
        });
      } else {
        // Fallback: create a simple colored rectangle
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Chart', canvas.width / 2, canvas.height / 2);
        }
      }
    } else if (el.type === 'text' || el.type === 'header') {
      const tag = el.type === 'header' ? (el.data?.headerSize || 'h1') : 'p';
      const textElement = document.createElement(tag);
      textElement.style.fontSize = el.data?.fontSize || '14px';
      textElement.style.fontWeight = el.data?.isBold ? 'bold' : 'normal';
      textElement.style.fontStyle = el.data?.isItalic ? 'italic' : 'normal';
      textElement.style.color = safeColor(el.data?.color || '#000000');
      textElement.style.margin = '0';
      textElement.style.padding = '0';
      textElement.style.lineHeight = '1.4';
      textElement.textContent = el.data?.text || '';
      elDiv.style.overflow = 'hidden';
      elDiv.style.wordBreak = 'break-all';
      elDiv.appendChild(textElement);
    } else if (el.type === 'table') {
      elDiv.style.padding = '4px';
      const tableData = el.data?.table || [['Header 1', 'Header 2', 'Header 3'], ['Data 1', 'Data 2', 'Data 3']];
      
      const tableContainer = document.createElement('div');
      tableContainer.style.overflow = 'auto';
      tableContainer.style.width = '100%';
      tableContainer.style.height = '100%';
      
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.fontSize = '10px';
      table.style.borderCollapse = 'collapse';
      table.style.border = '1px solid #e5e7eb';
      
      const tableBody = document.createElement('tbody');
      
      tableData.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
          const td = document.createElement('td');
          td.style.border = '1px solid #e5e7eb';
          td.style.padding = '2px';
          td.style.textAlign = 'left';
          td.textContent = cell;
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
      
      table.appendChild(tableBody);
      tableContainer.appendChild(table);
      elDiv.appendChild(tableContainer);
    } else if (el.type === 'image') {
      elDiv.style.padding = '0';
      if (el.data?.src) {
        const img = document.createElement('img');
        img.src = el.data.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        elDiv.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = '#9ca3af';
        placeholder.style.fontSize = '12px';
        placeholder.style.border = '2px dashed #d1d5db';
        placeholder.textContent = 'Placeholder Image';
        elDiv.appendChild(placeholder);
      }
    }
    
    if (el.container) {
      el.container.appendChild(elDiv);
    }
  });
  
  document.body.appendChild(tempDiv);
  
  try {
    // Use a simpler rendering approach with html2canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: safeColor(pageData.backgroundColor),
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure all colors are safe in the cloned document
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            const style = window.getComputedStyle(el);
            if (style.color) {
              el.style.color = safeColor(style.color);
            }
            if (style.backgroundColor) {
              el.style.backgroundColor = safeColor(style.backgroundColor);
            }
            if (style.borderColor) {
              el.style.borderColor = safeColor(style.borderColor);
            }
          }
        });
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    document.body.removeChild(tempDiv);
    return imgData;
  } catch (error) {
    console.error('Error rendering page for export:', error);
    document.body.removeChild(tempDiv);
    throw error;
  }
};

export const exportAsPdf = async (pages: PageData[]) => {
  const doc = new jsPDF({ 
    unit: 'px', 
    format: 'a4', 
    hotfixes: ['px_scaling'] as any 
  });
  
  try {
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        doc.addPage();
      }
      
      const imgData = await renderPageForExport(pages[i]);
      doc.addImage(
        imgData, 
        'PNG', 
        0, 
        0, 
        doc.internal.pageSize.getWidth(), 
        doc.internal.pageSize.getHeight(),
        undefined,
        'FAST'
      );
    }
    
    doc.save('template.pdf');
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
};