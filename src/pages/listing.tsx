import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    deleteTemplateFromServer,
    loadTemplatesFromServer,
    type Template,
} from "../utils/serverApi";
import Modal from "../components/Modal";
import investSet from "../assets/investSet.png"
import toastr from "toastr";
import "toastr/build/toastr.min.css";

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

const ListingScreen: React.FC = () => {
    const [templates, setTemplates] = useState<Templates[]>([]);
    const [modal, setModal] = useState<ModalConfig | null>(null);
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
            toastr.error(`Failed to load templates`)
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
                    toastr.success(`Template "${template.name}" deleted successfully!`)
                } catch (error) {
                    toastr.error(`Failed to delete template: ${error instanceof Error ? error.message : "Unknown error"
                        }`)
                    setModal(null);
                }
            },
            onCancel: () => setModal(null),
        });
    };

    return (
        <div className="">
            <div className="container flex items-center justify-between bg-white">
                <img
                    src={investSet}
                    alt="Invest Set Logo"
                    className=" object-contain"
                />
            </div>


            <div className="flex justify-end m-4 mt-8">
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Create
                </button>
            </div>
            <div className="overflow-x-auto mt-2 p-6">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Name</th>
                            <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Created Date</th>
                            <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Updated Date</th>
                            <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {templates.map((t) => (
                            <tr key={t.id}>
                                <td
                                    className="px-4 py-2 text-sm text-gray-800 cursor-pointer"
                                    onClick={() => handleEdit(t.id)}
                                >
                                    {t.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600"> {new Date(t.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm text-gray-600"> {new Date(t.updatedAt).toLocaleDateString()}</td>
                                <td className="px-4 py-2 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(t.id)}
                                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer"
                                        title="Edit"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t)}
                                        className="p-2 bg-red-600 text-white rounded cursor-pointer"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7M10 7V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center text-sm text-gray-500 py-4">
                                    No templates found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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