'use client'
import { Trash2 } from "lucide-react"
import { useState } from "react"

export default function DeleteConfirmation({ 
  isOpen, 
  onConfirm, 
  onCancel,
  isLoading = false 
}: { 
  isOpen: boolean, 
  onConfirm: () => Promise<void> | void, 
  onCancel: () => void,
  isLoading?: boolean
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    console.log('[DeleteConfirmation] Delete confirm button clicked!');
    setIsDeleting(true);
    try {
      console.log('[DeleteConfirmation] About to call onConfirm...');
      const result = await onConfirm();
      console.log('[DeleteConfirmation] onConfirm completed successfully', result);
    } catch (error) {
      console.error('[DeleteConfirmation] onConfirm failed:', error);
    } finally {
      console.log('[DeleteConfirmation] Setting isDeleting to false');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  console.log('[DeleteConfirmation] Modal is opening!', { isDeleting, isLoading, onConfirm: typeof onConfirm });
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onCancel}>
      <div 
        className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="p-6 flex justify-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-2 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Delete post?
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from Twitter search results.
          </p>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={(e) => {
              console.log('[DeleteConfirmation] Delete button onClick fired!', { isDeleting, isLoading });
              e.preventDefault();
              e.stopPropagation();
              handleConfirm();
            }}
            onMouseDown={(e) => {
              console.log('[DeleteConfirmation] Delete button onMouseDown! Triggering handleConfirm directly');
              e.preventDefault();
              e.stopPropagation();
              handleConfirm();
            }}
            onMouseUp={(e) => {
              console.log('[DeleteConfirmation] Delete button onMouseUp!');
            }}
            disabled={isDeleting || isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-full transition-colors"
          >
            {isDeleting || isLoading ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={(e) => {
              console.log('[DeleteConfirmation] Cancel button clicked!');
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
            disabled={isDeleting || isLoading}
            className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 font-bold py-2.5 px-4 rounded-full transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
