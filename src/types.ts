export interface ElementData {
  id: string;
  type: 'text' | 'header' | 'image' | 'table' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  containerId: string;
  data: {
    text?: string;
    color?: string;
    fontSize?: string;
    isBold?: boolean;
    isItalic?: boolean;
    headerSize?: string;
    src?: string;
    table?: string[][];
    chartType?: string;
    chartData?: any;
    labels?: string[];
    datasets?: { data?: any, label?: string, backgroundColor?: string}[]
  };
}

export interface PageData {
  elements: ElementData[];
  layout: string;
  backgroundColor: string;
  gridColor: string;
}

export interface LayoutCell {
  cells: string[][];
}

export interface ResizeData {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  direction: string;
}

export interface DragOffset {
  x: number;
  y: number;
}