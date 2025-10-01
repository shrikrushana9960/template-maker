import React, { useState, useRef, useCallback } from 'react';
import type { ElementData, PageData, ResizeData, DragOffset } from '../types';
import Element from './Element';

interface EditorProps {
  currentPage: PageData;
  onPageUpdate: (updates: Partial<PageData>) => void;
  onElementUpdate: (id: string, updates: Partial<ElementData>) => void;
  onElementDelete: (id: string) => void;
  onElementSelect: (element: ElementData | null) => void;
  onContainerSelect: (containerId: string | null) => void;
  activeElement: ElementData | null;
  activeContainer: string | null;
}

const Editor: React.FC<EditorProps> = ({
  currentPage,
  onPageUpdate,
  onElementUpdate,
  onElementDelete,
  onElementSelect,
  onContainerSelect,
  activeElement,
  activeContainer,
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [resizeData, setResizeData] = useState<ResizeData | null>(null);

  const getContainerBounds = useCallback((containerId: string) => {
    if (!pageRef.current) return null;
    
    const container = pageRef.current.querySelector(`[data-cell-id="${containerId}"]`) as HTMLElement;
    if (!container) return null;
    
    const containerRect = container.getBoundingClientRect();
    const pageRect = pageRef.current.getBoundingClientRect();
    
    return {
      left: containerRect.left - pageRect.left,
      top: containerRect.top - pageRect.top,
      width: containerRect.width,
      height: containerRect.height,
      right: containerRect.right - pageRect.left,
      bottom: containerRect.bottom - pageRect.top
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: ElementData) => {
    e.stopPropagation();
    onElementSelect(element);
    
    const target = e.target as HTMLElement;
    
    // Prevent dragging when clicking on input fields, textareas, etc.
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    if (target.classList.contains('resize-handle')) {
      // Start resizing
      const direction = target.getAttribute('data-direction');
      if (direction) {
        setIsResizing(true);
        setResizeData({
          startX: e.clientX,
          startY: e.clientY,
          startWidth: element.width,
          startHeight: element.height,
          direction,
        });
      }
    } else {
      // Start dragging
      setIsDragging(true);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [onElementSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!pageRef.current || (!isDragging && !isResizing)) return;

    if (isDragging && activeElement) {
      const containerBounds = getContainerBounds(activeElement.containerId);
      if (!containerBounds) return;

      const rect = pageRef.current.getBoundingClientRect();
      let newX = e.clientX - rect.left - dragOffset.x;
      let newY = e.clientY - rect.top - dragOffset.y;
      
      // Constrain to container bounds
      newX = Math.max(containerBounds.left, newX);
      newY = Math.max(containerBounds.top, newY);
      newX = Math.min(newX, containerBounds.left + containerBounds.width - activeElement.width);
      newY = Math.min(newY, containerBounds.top + containerBounds.height - activeElement.height);
      
      // Convert to container-relative coordinates
      const containerRelativeX = newX - containerBounds.left;
      const containerRelativeY = newY - containerBounds.top;
      
      onElementUpdate(activeElement.id, {
        x: containerRelativeX,
        y: containerRelativeY,
      });

      // Update the element position visually
      const elementDiv = document.querySelector(`.element-container[data-id="${activeElement.id}"]`) as HTMLElement;
      if (elementDiv) {
        elementDiv.style.left = `${containerRelativeX}px`;
        elementDiv.style.top = `${containerRelativeY}px`;
      }
      
    } else if (isResizing && activeElement && resizeData) {
      const containerBounds = getContainerBounds(activeElement.containerId);
      if (!containerBounds) return;

      const deltaX = e.clientX - resizeData.startX;
      const deltaY = e.clientY - resizeData.startY;
      
      let newWidth = resizeData.startWidth;
      let newHeight = resizeData.startHeight;
      let newX = activeElement.x;
      let newY = activeElement.y;

      const direction = resizeData.direction;
      
      // Handle resizing based on direction
      if (direction.includes('right')) {
        newWidth = Math.max(50, resizeData.startWidth + deltaX);
        // Constrain to container right edge
        newWidth = Math.min(newWidth, containerBounds.width - newX);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(30, resizeData.startHeight + deltaY);
        // Constrain to container bottom edge
        newHeight = Math.min(newHeight, containerBounds.height - newY);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(50, resizeData.startWidth - deltaX);
        newX = activeElement.x + deltaX;
        // Constrain to container left edge
        if (newX < 0) {
          newWidth += newX; // Reduce width by the amount we went past left edge
          newX = 0;
        }
      }
      if (direction.includes('top')) {
        newHeight = Math.max(30, resizeData.startHeight - deltaY);
        newY = activeElement.y + deltaY;
        // Constrain to container top edge
        if (newY < 0) {
          newHeight += newY; // Reduce height by the amount we went past top edge
          newY = 0;
        }
      }

      // Final constraints to ensure element stays within container
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      newX = Math.min(newX, containerBounds.width - newWidth);
      newY = Math.min(newY, containerBounds.height - newHeight);

      onElementUpdate(activeElement.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });

      // Update the element visually
      const elementDiv = document.querySelector(`.element-container[data-id="${activeElement.id}"]`) as HTMLElement;
      if (elementDiv) {
        elementDiv.style.left = `${newX}px`;
        elementDiv.style.top = `${newY}px`;
        elementDiv.style.width = `${newWidth}px`;
        elementDiv.style.height = `${newHeight}px`;
      }
    }
  }, [isDragging, isResizing, activeElement, dragOffset, resizeData, onElementUpdate, getContainerBounds]);

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      // Force a re-render to update the element positions in state
      if (activeElement) {
        onElementUpdate(activeElement.id, {});
      }
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeData(null);
  }, [isDragging, isResizing, activeElement, onElementUpdate]);

  const handleContainerClick = useCallback((e: React.MouseEvent, cellId: string) => {
    // Only select container if clicking on the container itself, not on an element
    if ((e.target as HTMLElement).classList.contains('dashboard-item')) {
      e.stopPropagation();
      onContainerSelect(cellId);
      onElementSelect(null);
    }
  }, [onContainerSelect, onElementSelect]);

  const handlePageClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect(null);
      onContainerSelect(null);
    }
  }, [onElementSelect, onContainerSelect]);

  // Add keyboard event listener for delete
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' ) && activeElement) {
        e.preventDefault();
        onElementDelete(activeElement.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeElement, onElementDelete]);

  const layoutData = currentPage?.layout ? JSON.parse(currentPage.layout) : null;
  const uniqueCells = layoutData?.cells ? [...new Set(layoutData?.cells.flat())] : [];


  return (
    <div 
      className="flex-1 overflow-auto bg-gray-100"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="editor-page-container">
        <div 
          ref={pageRef}
          className="editor-page"
          onClick={handlePageClick}
          style={{
            display: 'grid',
            gridTemplateRows: layoutData?.cells?.map(() => '1fr').join(' '),
            gridTemplateAreas: layoutData?.cells?.map(row => `"${row?.map(cell => cell?.toLowerCase()).join(' ')}"`).join(' '),
            gap: '0.5rem',
            backgroundColor: currentPage.backgroundColor,
            position: 'relative', // Important for absolute positioning of elements
          }}
        >
          {uniqueCells.map(cell => (
            <div
              key={cell}
              data-cell-id={cell}
              className={`dashboard-item ${activeContainer === cell ? 'active' : ''}`}
              style={{
                gridArea: cell.toLowerCase(),
                backgroundColor: currentPage.gridColor,
                position: 'relative', // Important for containing absolute elements
                minHeight: '200px',
                overflow: 'hidden', // Prevent elements from visually overflowing
              }}
              onClick={(e) => handleContainerClick(e, cell)}
            >
              {currentPage.elements
                .filter(el => el.containerId === cell)
                .map(element => (
                  <Element
                    key={element.id}
                    element={element}
                    onMouseDown={handleMouseDown}
                    onUpdate={onElementUpdate}
                  />
                ))
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Editor;