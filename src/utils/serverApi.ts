import { v4 as uuidv4 } from "uuid";

export interface Template {
  id?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  pages: string; // JSON string of PageData[]
}

const API_BASE = "http://43.241.63.71:3006/";
const API_URL = `${API_BASE}/templates`;

// ✅ Check if server is available
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE, {
      method: "HEAD",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// ✅ Get all templates
export const loadTemplatesFromServer = async (): Promise<Template[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading templates:", error);
    throw new Error(
      "Failed to connect to server. Please make sure the JSON server is running on port 3001."
    );
  }
};

// ✅ Save template (create new if not exist, otherwise update)
export const saveTemplateToServer = async (
  name: string,
  pages: any[]
): Promise<Template> => {
  const now = new Date().toISOString();

  const templateData: Template = {
    id: uuidv4(),
    name,
    createdAt: now,
    updatedAt: now,
    pages: JSON.stringify(pages),
  };

  try {
    // ✅ check by name, not id
    const existingResponse = await fetch(
      `${API_URL}?id=${encodeURIComponent(name)}`
    );
    const existingTemplates: Template[] = await existingResponse.json();

    let response: Response;

    if (existingTemplates.length > 0) {
      delete templateData?.id;
      delete templateData?.name;
      // ✅ Update existing template (preserve createdAt)
      const existingTemplate = existingTemplates[0];

      const updatedTemplate: Template = {
        ...existingTemplate,
        ...templateData,
        id: existingTemplate.id,
        createdAt: existingTemplate.createdAt,
        updatedAt: now,
      };

      response = await fetch(`${API_URL}/${existingTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTemplate),
      });
    } else {
      // ✅ Create new template
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });
    }

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving template:", error);
    throw new Error(
      "Failed to save template to server. Please check your connection."
    );
  }
};

// ✅ Update template data by ID
export const updateTemplateOnServer = async (
  templateId: string,
  updates: Partial<Omit<Template, "id" | "createdAt">>
): Promise<Template> => {
  try {
    const response = await fetch(`${API_URL}/${templateId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating template:", error);
    throw new Error("Failed to update template on server.");
  }
};

// ✅ Delete template from server
export const deleteTemplateFromServer = async (
  templateId: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${templateId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    throw new Error("Failed to delete template from server.");
  }
};

// ✅ Load specific template by ID
export const loadTemplateFromServer = async (
  templateId: string
): Promise<Template> => {
  try {
    const response = await fetch(`${API_URL}/${templateId}`);
    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading template:", error);
    throw new Error("Failed to load template from server.");
  }
};
