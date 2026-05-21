import React, { useState } from "react";
import { X } from "lucide-react";

interface CreateCategoryModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateCategoryModal({ onClose, onCreate }: CreateCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-full max-w-[440px] rounded-lg shadow-2xl flex flex-col font-sans text-[#DBDEE1] scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-4 flex flex-col items-center justify-center relative">
          <h2 className="text-xl font-bold text-white mb-1 leading-tight">Create Category</h2>
          <button onClick={onClose} className="absolute right-4 top-4 text-[#949BA4] hover:text-[#DBDEE1] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold uppercase text-[#B5BAC1]">Category Name</label>
            <div className="relative flex items-center bg-[#1E1F22] rounded overflow-hidden p-2">
              <input 
                type="text" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value.toUpperCase())}
                placeholder="New Category" 
                className="bg-transparent text-white outline-none w-full text-base ml-1" 
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && categoryName.trim()) {
                    onCreate(categoryName);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#2B2D31] rounded-b-lg flex items-center justify-between mt-4">
          <div className="text-sm font-medium text-white cursor-pointer hover:underline" onClick={onClose}>Cancel</div>
          <button 
            disabled={!categoryName.trim()}
            onClick={() => onCreate(categoryName)}
            className="bg-[#5865F2] text-white px-6 py-2.5 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4752C4] transition-colors"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
}
