import React, { useState } from "react";
import investSet from "../assets/investSet.png";
import toastr from "toastr";
import type { PageData } from "../types";
import { saveTemplateToServer } from "../utils/serverApi";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";
import New from "../assets/new.svg";
import Load from "../assets/load.svg";
import Save from "../assets/save.svg";
import Download from "../assets/download.svg";
import Export from "../assets/export.svg";
import PrevArrow from "../assets/prevArrow.svg";
import NextArrow from "../assets/nextArrow.svg";
import Add from "../assets/add.svg";
import Delete from "../assets/delete.svg";

interface ToolbarProps {
  onNewTemplate: () => void;
  currentPages: PageData[];
  currentPage: number;
  onSaveTemplate: () => void;
  onImportJson: (file: File) => void;
  onExportPdf: () => void;
  onAddElement: (type: string, chartType?: string) => void;
  onAddPage: () => void;
  onDeletePage: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAutofill: () => void;
  totalPages: number;
}

interface ModalConfig {
  title: string;
  message: string;
  type: "info" | "confirm" | "input";
  onConfirm: (templateName: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNewTemplate,
  onSaveTemplate,
  onImportJson,
  onExportPdf,
  currentPages,
  onAddElement,
  onAddPage,
  onDeletePage,
  onPrevPage,
  onNextPage,
  onAutofill,
  currentPage,
  totalPages,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleSaveTemplate = async () => {
    if (id) {
      await saveTemplateToServer(id, currentPages);
      navigate("/");
      toastr.success(`Template updated successfully!`);
    } else
      setModal({
        title: "Save Template",
        message: "Enter a name for your template",
        type: "input",
        placeholder: "Template name",
        onConfirm: async (templateName: string) => {
          if (!templateName) return;

          setSaveLoading(true);
          try {
            await saveTemplateToServer(templateName, currentPages);
            navigate("/");
            setModal(null);
            toastr.success(`Template "${templateName}" saved successfully!`);
          } catch (error) {
            setModal(null);
            toastr.error(
              `Failed to save template: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          } finally {
            setSaveLoading(false);
          }
        },
        onCancel: () => setModal(null),
      });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
  };

  const elementButtons = [
    // { type: 'header', label: 'Header', icon: 'M4 12h16M12 4v16' },
    { type: "text", label: "Text", icon: "M4 12h16M16 8h-8M16 16h-8" },
    {
      type: "image",
      label: "Image",
      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    },
    {
      type: "table",
      label: "Table",
      icon: "M12 2v20M2 7h20M2 17h20M7 2v20M17 2v20",
    },
    {
      type: "chart",
      chartType: "bar",
      label: "Bar Chart",
      icon: "M18 20V10M12 20V4M6 20v-6",
    },
    {
      type: "chart",
      chartType: "line",
      label: "Line Chart",
      icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    },
  ];

  return (
    <div className="bg-white shadow-md z-20">
      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm as  ((inputValue?: string) => void) | (() => void)}
          onCancel={() => setModal(null)}
        />
      )}
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div
            className="overflow-hidden cursor-pointer flex items-center"
            onClick={() => navigate("/")}
          >
            <img
              src={investSet}
              alt="Invest Set Logo"
              className="w-full h-full object-contain"
            />
            <span className="ml-2 text-lg font-semibold">Investset</span>
          </div>
          {/* File Section */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-500">File</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onNewTemplate}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <img src={New} />
                <span className="text-xs text-gray-700 mt-1">New</span>
              </button>

              <button
                onClick={handleImportClick}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <img src={Load} />
                <span className="text-xs text-gray-700 mt-1">Load</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={handleSaveTemplate}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <img src={Save} />
                <span className="text-xs text-gray-700 mt-1">Save</span>
              </button>

              <button
                onClick={onSaveTemplate}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <img src={Download} alt="Export PDF" className="w-6 h-6" />
                <span className="text-xs text-gray-700 mt-1">
                  Download template
                </span>
              </button>
              <button
                onClick={onAutofill}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <img src={Download} alt="Autofill" className="w-6 h-6" />
                <span className="text-xs text-gray-700 mt-1">Autofill</span>
              </button>
              <button
                onClick={onExportPdf}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <img src={Export} alt="Export PDF" className="w-6 h-6" />
                <span className="text-xs text-gray-700 mt-1">Export PDF</span>
              </button>
            </div>
          </div>

          {/* Pages Section */}
          <div className="flex flex-col items-center border-l border-gray-200 pl-4">
            <span className="text-xs font-semibold text-gray-500">Pages</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrevPage}
                disabled={currentPage === 0}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={PrevArrow} alt="Export PDF" className="w-6 h-6" />
                <span className="text-xs text-gray-700 mt-1">Prev</span>
              </button>

              <span className="text-xs font-medium text-gray-700 mt-1">
                Page {currentPage + 1} / {totalPages}
              </span>

              <button
                onClick={onNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={NextArrow} alt="Export PDF" className="w-6 h-6" />
                <span className="text-xs text-gray-700 mt-1">Next</span>
              </button>

              <button
                onClick={onAddPage}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <img src={Add} alt="Export PDF" className="w-6 h-6" />
                <span className="text-xs text-gray-700 mt-1">Add Page</span>
              </button>

              <button
                onClick={onDeletePage}
                disabled={totalPages === 1}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={Delete} alt="Export PDF" className="w-6 h-6" />

                <span className="text-xs text-gray-700 mt-1">Delete Page</span>
              </button>
            </div>
          </div>

          {/* Elements Section */}
          <div className="flex flex-col items-center border-l border-gray-200 pl-4">
            <span className="text-xs font-semibold text-gray-500">
              Elements
            </span>
            <div className="flex items-center space-x-2">
              {elementButtons.map((btn) => (
                <button
                  key={`${btn.type}-${btn.chartType || ""}`}
                  onClick={() => onAddElement(btn.type, btn.chartType)}
                  className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={btn.icon} />
                  </svg>
                  <span className="text-xs text-gray-700 mt-1">
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
