import React from 'react';

interface ModalProps {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'info' | 'confirm';
}

const Modal: React.FC<ModalProps> = ({ title, message, onConfirm, onCancel, type = 'info' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg text-center max-w-md">
        <h3 className="font-semibold text-lg mb-4">{title}</h3>
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        
        {type === 'info' ? (
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            OK
          </button>
        ) : (
          <div className="flex justify-center space-x-3">
            <button
              onClick={onConfirm}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;