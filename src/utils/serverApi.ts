const API_URL = 'http://localhost:3001/templates';

export interface Template {
  id: string;
  pages: string;
}

export const saveTemplateToServer = async (templateName: string, pages: any): Promise<void> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: templateName, pages: JSON.stringify(pages) })
  });
  
  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }
};

export const loadTemplatesFromServer = async (): Promise<Template[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

export const deleteTemplateFromServer = async (templateId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${templateId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }
};