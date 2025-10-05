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
import reportDataJson from './reportData.json';
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
  onConfirm: ((inputValue?: string) => void) | (() => void); 
  onCancel?: () => void;
  placeholder?: string;
}
const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl shadow-md bg-white">
      <svg
        className="animate-spin h-10 w-10 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span className="text-gray-700 text-sm font-medium">
        {message || "Loading..."}
      </span>
    </div>
  </div>
);


const ListingScreen: React.FC = () => {
  const reportData: any = reportDataJson;
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
      setTemplates(serverTemplates as Templates[]);
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
          await deleteTemplateFromServer(template.id as string);
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
   

    return pages.map((page) => {
      const elementCounters: Record<ElementData["type"], number> = {
        header: 0,
        text: 0,
        table: 0,
        chart: 0,
        image: 0,
      };

      return {
        ...page,
        elements: page.elements.map((element) => {
          const elementIndex = elementCounters[element.type]++;
          let newUpdates: Partial<ElementData> = {};
          console.log(element?.id);
          switch (element.type) {
            case "text":
              newUpdates.data = {
                ...element.data,
                text: reportData?.[element?.id] || "",
              };
              break;

            case "image":
                newUpdates.data = {
                  ...element.data,
                  src: reportData[element?.id] || "",
                };
              break;

            case "table":
            
                newUpdates.data = {
                  ...element.data,
                  table: reportData[element?.id] || [],
                };
             
              break;

            case "chart":
                newUpdates.data = {
                  ...element.data,
                  labels: reportData?.[element?.id]?.labels || [],
                  chartType: element.data.chartType || "pie",
                  datasets: [
                    {
                      label: "",
                      data: reportData?.[element?.id]?.data || [],
                      backgroundColor:
                        reportData?.[element?.id]?.colors || [],
                    },
                  ],
                };
           
              break;

            default:
              newUpdates.data = { ...element.data, text: "" };
              break;
          }

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
      const response = await loadTemplateFromServer(template.id as string);
      const loadedPages: PageData[] = JSON.parse(response?.pages);

      // 2. Apply the Richened report data fill
      const mockedPages = applyReportFillToPages(loadedPages);

      // 3. Export as PDF
      toastr.info("Generating PDF...");
      await exportAsPdf(mockedPages,template.name+(new Date().toISOString())+".pdf");

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
