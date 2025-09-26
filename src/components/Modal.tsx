import React, { useState } from 'react';

interface ModalProps {
  title: string;
  message?: string;
  onConfirm?: ((inputValue?: string) => void) | (() => void); // allow both
  onCancel?: () => void;
  type?: 'info' | 'confirm' | 'input'; // 'input' for textfield
  placeholder?: string; // optional placeholder for input
}

const Modal: React.FC<ModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  type = 'info',
  placeholder = '',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (type === 'input') {
      onConfirm?.(inputValue.trim());
    } else {
      onConfirm?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black opacity-90 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg text-center max-w-md w-full">
        <h3 className="font-semibold text-lg mb-4">{title}</h3>
        {message && <p className="text-sm text-gray-700 mb-4">{message}</p>}

        {type === 'input' && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded mb-6 focus:outline-none focus:ring focus:border-blue-300"
          />
        )}

        <div className="flex justify-center space-x-3">
          {type === 'info' ? (
            <button
              onClick={handleConfirm}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              OK
            </button>
          ) : (
            <>
              <button
                onClick={handleConfirm}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                disabled={type === 'input' && !inputValue.trim()}
              >
                Confirm
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500  cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;