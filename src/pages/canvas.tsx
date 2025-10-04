import React, { useState, useCallback, useEffect } from 'react';
import Toolbar from '../components/Toolbar';
import Editor from '../components/Editor';
import RightPanel from '../components/RightPanel';
import Modal from '../components/Modal';
import type { ElementData, PageData } from '../types';
import { exportAsPdf } from '../utils/exportUtils';
import { useLocation } from 'react-router-dom';
import { loadTemplateFromServer } from '../utils/serverApi';

const defaultPage: PageData = {
    elements: [],
    layout: JSON.stringify({ cells: [['A', 'B']] }),
    backgroundColor: '#ffffff',
    gridColor: '#f8fafc',
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
    const [pages, setPages] = useState<PageData[]>([{ ...defaultPage }]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [activeElement, setActiveElement] = useState<ElementData | null>(null);
    const [activeTab, setActiveTab] = useState('layout');
    const [modal, setModal] = useState<{ title: string; message: string; type: 'info' | 'confirm'; onConfirm?: () => void } | null>(null);
    const [activeContainer, setActiveContainer] = useState<string | null>(null); // Track active container

    const currentPage = pages[currentPageIndex];

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');


    useEffect(() => {
        if (id) {
            loadCurrectElement(id);
        }
    }, [id]);

    const loadCurrectElement = async (id: string) => {
        try {
            const response = await loadTemplateFromServer(id);

            setPages(JSON.parse(response?.pages));
            setCurrentPageIndex(0);
            setActiveElement(null);
            setActiveContainer(null);

        } catch (err) {
            console.log(err);

        }
    }


    const updateCurrentPage = useCallback((updates: Partial<PageData>) => {
        setPages(prev => prev.map((page, index) =>
            index === currentPageIndex ? { ...page, ...updates } : page
        ));
    }, [currentPageIndex]);

    const handleLoadTemplate = useCallback((pages: PageData[]) => {
        setPages(pages);
        setCurrentPageIndex(0);
        setActiveElement(null);
        setActiveContainer(null);
    }, []);
    const updateElement = useCallback((id: string, updates: Partial<ElementData>) => {
        setPages(prev => prev.map((page, index) =>
            index === currentPageIndex ? {
                ...page,
                elements: page.elements.map(el =>
                    el.id === id ? { ...el, ...updates } : el
                )
            } : page
        ));
    }, [currentPageIndex]);

    const deleteElement = useCallback((id: string) => {
        setPages(prev => prev.map((page, index) =>
            index === currentPageIndex ? {
                ...page,
                elements: page.elements.filter(el => el.id !== id)
            } : page
        ));
        setActiveElement(null);
    }, [currentPageIndex]);

    const addElement = useCallback((type: string, chartType?: string) => {
        const layoutData = JSON.parse(currentPage.layout);


        const uniqueCells = [...new Set(layoutData.cells.flat())];

        // Use active container if set, otherwise use first available cell
        let containerId = activeContainer;

        if (!containerId) {
            // If no active container, try to find a cell with fewer elements
            const cellElementCounts = uniqueCells.map(cell => ({
                cell,
                count: currentPage.elements.filter(el => el.containerId === cell).length
            }));

            // Find the cell with the fewest elements
            const leastUsedCell :string= cellElementCounts.reduce((prev, current) =>
                prev.count < current.count ? prev : current
            ).cell as string;

            containerId = leastUsedCell;
        }

        // If still no container (shouldn't happen), fallback to first cell
        if (!containerId && uniqueCells.length > 0) {
            containerId = uniqueCells[0] as string;
        }

        if (!containerId) {
            setModal({
                title: 'Error',
                message: 'No container available to add element.',
                type: 'info',
                onConfirm: () => setModal(null)
            });
            return;
        }

        const newElement: ElementData = {
            id: generateId(),
            type: type as any,
            x: 10,
            y: 10,
            width: 200,
            height: type === 'header' ? 40 : type === 'image' ? 150 : 100,
            containerId,
            data: {
                text: type === 'header' ? 'New Header' : type === 'text' ? 'New Text' : '',
                color: '#000000',
                fontSize: type === 'header' ? '24px' : '14px',
                isBold: type === 'header',
                isItalic: false,
                headerSize: 'h1',
                chartType,
            },
        };

        if (type === 'table') {
            newElement.data.table = [['Header 1', 'Header 2', 'Header 3'], ['Data 1', 'Data 2', 'Data 3']];
        }

        if (type === 'chart') {
            newElement.data.chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                datasets: [{
                    label: 'Sample Data',
                    data: [65, 59, 80, 81],
                    backgroundColor: chartType === 'line' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(153, 102, 255, 0.2)',
                    borderColor: chartType === 'line' ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    tension: chartType === 'line' ? 0.4 : 0
                }]
            };
        }

        setPages(prev => prev.map((page, index) =>
            index === currentPageIndex ? {
                ...page,
                elements: [...page.elements, newElement]
            } : page
        ));
        setActiveElement(newElement);
        setActiveTab('settings');
    }, [currentPageIndex, currentPage.layout, currentPage.elements, activeContainer]);

    const handleNewTemplate = () => {
        setModal({
            title: 'New Template',
            message: 'Are you sure you want to create a new template? All unsaved changes will be lost.',
            type: 'confirm',
            onConfirm: () => {
                setPages([{ ...defaultPage }]);
                setCurrentPageIndex(0);
                setActiveElement(null);
                setActiveContainer(null);
                setModal(null);
            }
        });
    };

    const handleSaveTemplate = () => {
        const dataStr = JSON.stringify(pages, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'template.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        setModal({
            title: 'Success',
            message: 'Template saved successfully!',
            type: 'info',
            onConfirm: () => setModal(null)
        });
    };

    const handleImportJson = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedPages = JSON.parse(e.target?.result as string);
                setPages(importedPages);
                setCurrentPageIndex(0);
                setActiveElement(null);
                setActiveContainer(null);
                setModal({
                    title: 'Success',
                    message: 'Template imported successfully!',
                    type: 'info',
                    onConfirm: () => setModal(null)
                });
            } catch (error) {
                setModal({
                    title: 'Error',
                    message: 'Invalid JSON file. Please select a valid template file.',
                    type: 'info',
                    onConfirm: () => setModal(null)
                });
            }
        };
        reader.readAsText(file);
    };

    const handleExportPdf = async () => {
        try {
            setModal({
                title: 'Exporting PDF',
                message: 'Generating PDF... This may take a moment.',
                type: 'info',
                onConfirm: () => setModal(null)
            });

            await exportAsPdf(pages);

            setModal({
                title: 'Success',
                message: 'PDF exported successfully!',
                type: 'info',
                onConfirm: () => setModal(null)
            });
        } catch (error) {
            console.error('PDF export error:', error);
            setModal({
                title: 'Export Error',
                message: 'Failed to export PDF. The document may contain unsupported elements. Please try simplifying your template.',
                type: 'info',
                onConfirm: () => setModal(null)
            });
        }
    };

    const handleAddPage = () => {
        setPages(prev => [...prev, { ...defaultPage }]);
        setCurrentPageIndex(pages.length);
        setActiveElement(null);
        setActiveContainer(null);
    };

    const handleDeletePage = () => {
        if (pages.length === 1) {
            setModal({
                title: 'Cannot Delete',
                message: 'You cannot delete the last page.',
                type: 'info',
                onConfirm: () => setModal(null)
            });
            return;
        }

        setModal({
            title: 'Delete Page',
            message: 'Are you sure you want to delete this page? This action cannot be undone.',
            type: 'confirm',
            onConfirm: () => {
                setPages(prev => prev.filter((_, index) => index !== currentPageIndex));
                setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
                setActiveElement(null);
                setActiveContainer(null);
                setModal(null);
            }
        });
    };

   const handleAutofill = () => {
    // 1. Prepare mock data values
    const mockText = 'Autofilled sample text for this content area.';
    const mockLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const mockData = [12, 19, 3, 5, 2];
    const mockTableHeader = ['Metric', 'Q1', 'Q2', 'Q3', 'Q4'];
    const mockTableData = [
        mockTableHeader,
        ['Revenue', '1.2M', '1.5M', '1.8M', '2.1M'],
        ['Profit', '250K', '300K', '350K', '400K'],
    ];
    const mockImageUrl = 'https://picsum.photos/300/200'; // Placeholder image URL

    // 2. Map over the existing elements on the current page to update them
    const updatedElements = currentPage.elements.map(element => {
        let newUpdates: Partial<ElementData> = {};
        
        // Update the data property based on the element type
        switch (element.type) {
            case 'header':
                newUpdates.data = {
                    ...element.data,
                    text: `Report Title for ${element.containerId}`,
                    isBold: true,
                    fontSize: '32px' 
                };
                break;
            case 'text':
                newUpdates.data = {
                    ...element.data,
                    text: `${mockText} (Container: ${element.containerId})`,
                };
                break;
            case 'image':
                newUpdates.data = {
                    ...element.data,
                    src: mockImageUrl,
                };
                break;
            case 'table':
                newUpdates.data = {
                    ...element.data,
                    table: mockTableData,
                };
                break;
            case 'chart':
                newUpdates.data = {
                    ...element.data,
                    labels: mockLabels,
                    datasets: [
                        {
                            label: `Data for ${element.containerId}`,
                            data: mockData,
                            // Preserve existing colors if possible
                            backgroundColor: element.data.datasets?.[0]?.backgroundColor || 'rgba(75,192,192,0.6)',
                        },
                    ],
                };
                break;
            default:
                // Do nothing for unknown types
                return element; 
        }

        // Return the updated element
        return { ...element, ...newUpdates };
    });

    // 3. Update the state with the modified elements array
    setPages(prev => prev.map((page, index) =>
        index === currentPageIndex ? {
            ...page,
            elements: updatedElements, // Replace old elements with updated ones
        } : page
    ));
};
    const handleLayoutChange = (layout: string) => {
        const layoutData = JSON.parse(layout);
        const newCells = layoutData.cells.flat();

        // Filter out elements that don't belong to the new layout cells
        const filteredElements = currentPage.elements.filter(el =>
            newCells.includes(el.containerId)
        );

        updateCurrentPage({
            layout,
            elements: filteredElements
        });
        setActiveContainer(null);
    };

    const handleElementSelect = (element: ElementData | null) => {
        setActiveElement(element);
        if (element) {
            setActiveContainer(element.containerId);
        }
    };

    const handleContainerSelect = (containerId: string | null) => {
        setActiveContainer(containerId);
        setActiveElement(null);
    };

    return (
        <div className="h-screen flex flex-col">
            <Toolbar
                onNewTemplate={handleNewTemplate}
                onSaveTemplate={handleSaveTemplate}
                onImportJson={handleImportJson}
                onExportPdf={handleExportPdf}
                onAddElement={addElement}
                onAddPage={handleAddPage}
                 currentPages={pages}
                onDeletePage={handleDeletePage}
                onPrevPage={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                onNextPage={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
                onAutofill={handleAutofill}
                currentPage={currentPageIndex}
                totalPages={pages.length}
            />

            <div className="flex-1 flex overflow-hidden">
                <Editor
                    currentPage={currentPage}
                    onPageUpdate={updateCurrentPage}
                    onElementUpdate={updateElement}
                    onElementDelete={deleteElement}
                    onElementSelect={handleElementSelect}
                    onContainerSelect={handleContainerSelect}
                    activeElement={activeElement}
                    activeContainer={activeContainer}
                />

                <RightPanel
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    activeElement={activeElement}
                    currentPage={currentPage}
                    onPageUpdate={updateCurrentPage}
                    onElementUpdate={updateElement}
                    onElementDelete={deleteElement}
                    onLayoutChange={handleLayoutChange}
                    activeContainer={activeContainer}
                    onLoadTemplate={handleLoadTemplate}
                    currentPages={pages} // Pass all pages
                />
            </div>

            {modal && (
                <Modal
                    title={modal.title}
                    message={modal.message}
                    type={modal.type}
                    onConfirm={modal.onConfirm}
                    onCancel={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default App;