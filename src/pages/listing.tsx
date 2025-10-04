// fileName: listing.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteTemplateFromServer,
  loadTemplatesFromServer,
  loadTemplateFromServer,
  type Template,
} from "../utils/serverApi";
import Modal from "../components/Modal";
import investSet from "../assets/investSet.png";
import Delete from "../assets/delete.svg";
import { exportAsPdf } from "../utils/exportUtils";
import Edit from "../assets/editIcon.svg";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import type { ElementData, PageData } from "../types";
interface Templates {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pages: string;
}

interface ModalConfig {
  title: string;
  message: string;
  type: "info" | "confirm" | "input";
  onConfirm: (templateName: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}
const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded shadow flex flex-col items-center">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
      <span>{message || "Loading..."}</span>
    </div>
    <style>{`
      .loader {
        border-top-color: #3498db;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
    `}</style>
  </div>
);

const ListingScreen: React.FC = () => {
  const [templates, setTemplates] = useState<Templates[]>([]);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
    const stored = localStorage.getItem("templates");
    if (stored) setTemplates(JSON.parse(stored));
  }, []);

  const loadTemplates = async () => {
    try {
      const serverTemplates = await loadTemplatesFromServer();
      setTemplates(serverTemplates);
    } catch (error) {
      console.error("Failed to load templates:", error);
      setTemplates([]);
      toastr.error(`Failed to load templates`);
    } finally {
      console.log();
    }
  };

  const handleCreate = () => {
    navigate("/canvas");
  };

  const handleEdit = (id: string) => {
    navigate(`/canvas?id=${id}`);
  };

  const handleDelete = (template: Template) => {
    setModal({
      title: "Delete Template",
      message: `Are you sure you want to delete template "${template.name}"?`,
      type: "confirm",
      onConfirm: async () => {
        try {
          await deleteTemplateFromServer(template.id);
          await loadTemplates();
          setModal(null);
          toastr.success(`Template "${template.name}" deleted successfully!`);
        } catch (error) {
          toastr.error(
            `Failed to delete template: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          setModal(null);
        }
      },
      onCancel: () => setModal(null),
    });
  };
  
  // FIX: Replaced applyAutofillToPages with logic that uses structured data
  const applyReportFillToPages = (pages: PageData[]): PageData[] => {
    // 1. Richer, Structured Report Data (Copied from canvas.tsx)
    const reportData = {
        title: 'Q3 Investment Portfolio Review',
        summary: `The portfolio delivered a strong performance in Q3, driven primarily by gains in the Technology and Healthcare sectors. Net return for the quarter was 7.8%, significantly outpacing the benchmark index's 4.5%. We recommend maintaining the current allocation with a slight overweight to growth stocks.`,
        keyMetricsTable: [
            ['Metric', 'Q1', 'Q2', 'Q3', 'YTD'],
            ['Total Return', '2.1%', '4.9%', '7.8%', '16.1%'],
            ['Volatility (Ann.)', '12.5%', '11.8%', '10.5%', '10.5%'],
            ['AUM (Millions)', '$540M', '$565M', '$610M', '$610M'],
        ],
        sectorPerformance: {
            labels: ['Tech', 'Health', 'Finance', 'Energy', 'Real Estate'],
            data: [25, 18, 12, 8, 5], // Percentages
            colors: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(99, 102, 241, 0.8)'],
        },
        marketTrend: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            data: [100, 102, 105, 103, 108, 112, 115, 110, 118], // Index value
            label: 'Portfolio Index Value',
        },
        clientPhoto: 'https://picsum.photos/400/300?random=1',
        disclaimer: 'This report is for informational purposes only and is not investment advice. Past performance is not indicative of future results.',
    };

    return pages.map((page) => {
      let headerCount = 0;
      let textCount = 0;
      let tableCount = 0;
      let chartCount = 0;
      let imageCount = 0;
      
      const textElements = page.elements.filter(e => e.type === 'text');
      const lastTextIndex = textElements.length - 1;


      return {
        ...page,
        elements: page.elements.map((element) => {
          let newUpdates: Partial<ElementData> = {};

          switch (element.type) {
            case "header":
              headerCount++;
              if (headerCount === 1) {
                newUpdates.data = {
                  ...element.data,
                  text: reportData.title,
                  isBold: true,
                  fontSize: "36px",
                  color: "#1e3a8a", 
                };
              } else {
                newUpdates.data = {
                  ...element.data,
                  text: `Section Header ${headerCount - 1}`,
                  isBold: true,
                  fontSize: "24px",
                };
              }
              break;
            case "text":
              const currentTextIndex = textCount;
              textCount++;
              
              if (currentTextIndex === 0) {
                newUpdates.data = {
                  ...element.data,
                  text: reportData.summary,
                };
              } else if (currentTextIndex === lastTextIndex) {
                newUpdates.data = {
                  ...element.data,
                  text: reportData.disclaimer,
                  fontSize: "10px",
                  color: "#6b7280",
                };
              } else {
                newUpdates.data = {
                  ...element.data,
                  text: `Detailed paragraph ${currentTextIndex} about the report findings. This is a longer text block to simulate full content.`,
                };
              }
              break;
            case "image":
              imageCount++;
              newUpdates.data = {
                ...element.data,
                src: reportData.clientPhoto.replace('random=1', `random=${imageCount}`),
              };
              break;
            case "table":
              tableCount++;
              newUpdates.data = {
                ...element.data,
                table: reportData.keyMetricsTable,
              };
              break;
            case "chart":
              chartCount++;
              if (chartCount === 1) {
                // Sector performance chart
                newUpdates.data = {
                  ...element.data,
                  labels: reportData.sectorPerformance.labels,
                  chartType: element.data.chartType || 'pie',
                  datasets: [
                    {
                      label: 'Sector Allocation',
                      data: reportData.sectorPerformance.data,
                      backgroundColor: reportData.sectorPerformance.colors,
                    },
                  ],
                };
              } else {
                // Market trend line chart
                newUpdates.data = {
                  ...element.data,
                  labels: reportData.marketTrend.labels,
                  chartType: element.data.chartType || 'line',
                  datasets: [
                    {
                      label: reportData.marketTrend.label,
                      data: reportData.marketTrend.data,
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                    },
                  ],
                };
              }
              break;
            default:
              // Do nothing for unknown types
              return element;
          }

          // Return the updated element
          return { ...element, ...newUpdates };
        }),
      };
    });
  };
  
  const handleMockAndExport = async (template: Template) => {
    setLoading(true);
    toastr.info(
      `Loading template "${template.name}" and applying mock data...`
    );
    try {
      // 1. Load the template
      const response = await loadTemplateFromServer(template.id);
      const loadedPages: PageData[] = JSON.parse(response?.pages);

      // 2. Apply the Richened report data fill
      const mockedPages = applyReportFillToPages(loadedPages);

      // 3. Export as PDF
      toastr.info("Generating PDF...");
      await exportAsPdf(mockedPages);

      toastr.success(
        `Mock data applied and PDF exported successfully for "${template.name}"!`
      );
    } catch (error) {
      console.error("Mock and Export error:", error);
      toastr.error(`Failed to generate mock PDF for "${template.name}".`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
        {loading && <LoadingOverlay message="Generating PDF, please wait..." />}

      <div className="bg-white shadow-md z-20">
        <div className="container mx-auto px-4 py-2 flex items-center">
          <img
            src={investSet}
            alt="Invest Set Logo"
            className=" object-contain"
          />
          <span className="ml-2 text-lg font-semibold">Investset</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 ">
        <div className="flex justify-end mt-8">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Create
          </button>
        </div>
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                  Created Date
                </th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                  Updated Date
                </th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 bg-white ">
              {templates.map((t) => (
                <tr key={t.id}>
                  <td
                    className="px-4 py-2 text-sm text-gray-800 cursor-pointer"
                    onClick={() => handleEdit(t.id)}
                  >
                    {t.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {" "}
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {" "}
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(t.id)}
                      className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer"
                      title="Edit"
                    >
                      <img src={Edit} alt="Edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-2 bg-red-600 text-white rounded cursor-pointer"
                      title="Delete"
                    >
                      <img src={Delete} alt="Delete" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMockAndExport(t)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-100 cursor-pointer text-xs"
                      title="Mock Data & PDF"
                      disabled={loading}
                    >
                      Mock & PDF
                    </button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-sm text-gray-500 py-4"
                  >
                    No templates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default ListingScreen;