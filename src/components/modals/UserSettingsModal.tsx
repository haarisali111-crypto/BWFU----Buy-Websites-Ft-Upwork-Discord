import React, { useState, useRef } from "react";
import { X, User, LogOut } from "lucide-react";

interface UserSettingsModalProps {
  currentUser: any;
  onClose: () => void;
  onUpdateUser: (updates: any) => void;
}

export function UserSettingsModal({
  currentUser,
  onClose,
  onUpdateUser,
}: UserSettingsModalProps) {
  const [username, setUsername] = useState(currentUser?.username || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateUser({ username, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#313338] text-[#DBDEE1] flex z-50 animate-in fade-in duration-200 font-sans">
      {/* Sidebar */}
      <div className="w-[30%] min-w-[200px] max-w-[260px] bg-[#2B2D31] flex flex-col items-end py-14 px-4 gap-[2px]">
        <div className="mb-1.5 text-xs font-bold text-[#949ba4] uppercase px-3 w-full max-w-[200px]">
          User Settings
        </div>
        <div className="w-full max-w-[200px] bg-[#404249] text-[#DBDEE1] px-3 py-1.5 rounded cursor-pointer text-[15px] font-medium transition-colors">
          My Account
        </div>
        <div className="w-full max-w-[200px] hover:bg-[#35373C] text-[#949BA4] hover:text-[#DBDEE1] px-3 py-1.5 rounded cursor-pointer text-[15px] font-medium transition-colors">
          Profiles
        </div>
        <div className="w-full max-w-[200px] hover:bg-[#35373C] text-[#949BA4] hover:text-[#DBDEE1] px-3 py-1.5 rounded cursor-pointer text-[15px] font-medium transition-colors">
          Privacy & Safety
        </div>

        <div className="mt-4 mb-1.5 text-xs font-bold text-[#949ba4] uppercase px-3 w-full max-w-[200px]">
          App Settings
        </div>
        <div className="w-full max-w-[200px] hover:bg-[#35373C] text-[#949BA4] hover:text-[#DBDEE1] px-3 py-1.5 rounded cursor-pointer text-[15px] font-medium transition-colors">
          Appearance
        </div>
        <div className="w-full max-w-[200px] hover:bg-[#35373C] text-[#949BA4] hover:text-[#DBDEE1] px-3 py-1.5 rounded cursor-pointer text-[15px] font-medium transition-colors">
          Voice & Video
        </div>

        <div className="w-full max-w-[200px] mt-auto">
          <div className="h-[1px] bg-[#1E1F22] w-full my-4" />
          <div className="hover:bg-[#DA373C]/10 text-[#F23F43] hover:text-[#DA373C] px-3 py-1.5 rounded cursor-pointer text-[15px] font-medium flex items-center transition-colors">
            Log Out
            <LogOut className="w-4 h-4 ml-auto" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#313338] p-10 pt-14 pb-0 relative overflow-y-auto custom-scrollbar flex flex-col items-start w-full max-w-[740px]">
        <div className="absolute top-14 right-10 flex flex-col items-center z-50">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-[#949BA4] flex items-center justify-center text-[#949BA4] hover:bg-[#35373C] hover:text-white cursor-pointer transition-colors mb-1 group"
          >
            <X className="w-5 h-5 group-hover:drop-shadow" />
          </button>
          <span className="text-xs font-bold text-[#949BA4]">ESC</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-6">My Account</h2>

        <div className="bg-[#1E1F22] rounded-lg p-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-[80px] h-[80px] rounded-full object-cover bg-gray-600"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold shadow-sm">
                    UPLOAD
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="text-white font-semibold text-lg">{username}</div>
            </div>
          </div>

          <div className="bg-[#2B2D31] p-4 rounded-lg space-y-4">
            <div>
              <label className="text-xs font-bold text-[#b5bac1] uppercase block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1E1F22] text-[#DBDEE1] p-2 rounded outline-none border border-transparent focus:border-[#5865F2]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2 rounded text-sm font-semibold transition-colors shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
