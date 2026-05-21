import React, { useState } from "react";
import { X, Search, ChevronRight } from "lucide-react";

interface AddServerModalProps {
  onClose: () => void;
  onCreate: (name: string, iconUrl?: string) => void;
}

export function AddServerModal({ onClose, onCreate }: AddServerModalProps) {
  const [step, setStep] = useState(1);
  const [serverName, setServerName] = useState("");
  const [iconUrl, setIconUrl] = useState("");

  const templates = [
    { name: "Gaming", img: "https://discord.com/assets/433f3e1bdce2ee388836.svg" },
    { name: "School Club", img: "https://discord.com/assets/57ac04a88ed0866b1859.svg" },
    { name: "Study Group", img: "https://discord.com/assets/2619717ab0cd4f386b0a.svg" },
    { name: "Friends", img: "https://discord.com/assets/19dbdd5affcd46fbaae1.svg" },
    { name: "Creators & Hobbies", img: "https://discord.com/assets/b6a22c1dd7af5426b377.svg" },
    { name: "Local Community", img: "https://discord.com/assets/9d63f0d55e09f58dcfe9.svg" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-full max-w-[440px] rounded-lg shadow-2xl flex flex-col font-sans text-[#DBDEE1] scale-100 animate-in zoom-in-95 duration-200 overflow-hidden relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#949BA4] hover:text-[#DBDEE1] z-10">
          <X className="w-6 h-6" />
        </button>

        {step === 1 && (
          <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Create a server</h2>
              <p className="text-[15px] text-[#B5BAC1]">Your server is where you and your friends hang out. Make yours and start talking.</p>
            </div>
            
            <div className="px-4 pb-4">
              <div 
                className="flex items-center gap-3 p-3 rounded-lg border border-[#1E1F22] hover:bg-[#35373C] cursor-pointer"
                onClick={() => setStep(2)}
              >
                 <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">+</div>
                 <div className="flex-1 font-bold text-white text-[15px]">Create My Own</div>
                 <ChevronRight className="w-5 h-5 text-[#949BA4]" />
              </div>
            </div>

            <div className="text-xs font-bold text-[#B5BAC1] uppercase px-4 mb-2">START FROM A TEMPLATE</div>
            
            <div className="px-4 pb-4 flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              {templates.map((tpl, i) => (
                <div 
                  key={i}
                  onClick={() => { setServerName(`${tpl.name} Server`); setStep(2); }}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#1E1F22] hover:bg-[#35373C] cursor-pointer"
                >
                   <div className="flex items-center gap-3">
                     <img src={tpl.img} className="w-8 h-8" alt={tpl.name} />
                     <span className="font-bold text-white text-[15px]">{tpl.name}</span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-[#949BA4]" />
                </div>
              ))}
            </div>

            <div className="bg-[#2B2D31] p-4 text-center mt-2 flex flex-col items-center">
               <h3 className="text-xl font-bold text-white mb-1">Have an invite already?</h3>
               <button className="w-full bg-[#4E5058] hover:bg-[#6D6F78] text-white py-2 rounded text-sm font-semibold mt-2 transition-colors">
                  Join a Server
               </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
             <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Customize your server</h2>
              <p className="text-[15px] text-[#B5BAC1]">Give your new server a personality with a name and an icon. You can always change it later.</p>
            </div>

            <div className="px-4 pb-4 flex flex-col items-center gap-6">
               <div className="w-20 h-20 rounded-full border border-dashed border-[#B5BAC1] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Server Icon" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="font-bold text-white text-xs z-10 uppercase">Upload</div>
                      <div className="w-6 h-6 bg-[#5865F2] rounded-full absolute -top-1 -right-1 flex items-center justify-center text-white">+</div>
                    </>
                  )}
               </div>

               <div className="w-full">
                  <label className="text-[12px] font-bold uppercase text-[#B5BAC1] block mb-2">Server Name</label>
                  <input 
                    type="text" 
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="bg-[#1E1F22] p-2.5 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none text-white w-full text-[15px]" 
                  />
                  <div className="text-xs text-[#949BA4] mt-2">By creating a server, you agree to Community Guidelines.</div>
               </div>
            </div>

            <div className="p-4 bg-[#2B2D31] flex flex-row items-center justify-between mt-auto">
               <div className="text-sm font-medium text-white cursor-pointer hover:underline" onClick={() => setStep(1)}>Back</div>
               <button 
                  disabled={!serverName.trim()}
                  onClick={() => onCreate(serverName, iconUrl)}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2.5 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                  Create
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
