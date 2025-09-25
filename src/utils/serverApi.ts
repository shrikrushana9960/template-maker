export interface Template {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pages: string; // JSON string of PageData[]
}

const API_BASE = 'http://localhost:3001';
const API_URL = `${API_BASE}/templates`;

// Check if server is available
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE, { 
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Get all templates
export const loadTemplatesFromServer = async (): Promise<Template[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading templates:', error);
    throw new Error('Failed to connect to server. Please make sure the JSON server is running on port 3001.');
  }
};

// Save template to server
export const saveTemplateToServer = async (name: string, pages: any[]): Promise<Template> => {
  const templateData = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name: name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: JSON.stringify(pages)
  };

  try {
    // Check if template already exists
    const existingResponse = await fetch(`${API_URL}?id=${templateData.id}`);
    const existingTemplates = await existingResponse.json();
    
    let response: Response;
    
    if (existingTemplates.length > 0) {
      // Update existing template
      response = await fetch(`${API_URL}/${templateData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...existingTemplates[0],
          ...templateData,
          updatedAt: new Date().toISOString()
        })
      });
    } else {
      // Create new template
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });
    }
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving template:', error);
    throw new Error('Failed to save template to server. Please check your connection.');
  }
};

// Delete template from server
export const deleteTemplateFromServer = async (templateId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${templateId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    throw new Error('Failed to delete template from server.');
  }
};

// Load specific template
export const loadTemplateFromServer = async (templateId: string): Promise<Template> => {
  try {
    const response = await fetch(`${API_URL}/${templateId}`);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading template:', error);
    throw new Error('Failed to load template from server.');
  }
};