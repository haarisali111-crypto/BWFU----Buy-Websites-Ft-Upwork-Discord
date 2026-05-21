import React, { useState } from "react";
import { X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InviteModalProps {
  channel: any;
  server?: any;
  onClose: () => void;
}

export function InviteModal({ channel, server, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteCode = "discord.gg/" + (server?.id || Math.random().toString(36).substring(2, 10));

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-full max-w-[440px] rounded-lg shadow-2xl flex flex-col font-sans text-[#DBDEE1] scale-100 animate-in zoom-in-95 duration-200 p-4 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#949BA4] hover:text-[#DBDEE1]">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 pt-2">
          <h2 className="text-[12px] font-bold text-[#B5BAC1] uppercase mb-1">Invite friends to</h2>
          <h1 className="text-xl font-bold text-white flex items-center">
            <span className="text-[#949BA4] mr-1">#</span> {channel?.name || "server"}
          </h1>
        </div>

        <div className="mb-6 flex space-x-2">
           <div className="flex-1 bg-[#1E1F22] border border-[#1E1F22] rounded flex items-center overflow-hidden focus-within:border-[#5865F2] transition-colors relative">
             <input 
               type="text" 
               readOnly
               value={inviteCode}
               className="bg-transparent text-[#DBDEE1] p-3 w-full outline-none text-sm"
             />
             <button 
               onClick={handleCopy}
               className={cn(
                 "absolute right-1 px-4 py-1.5 rounded text-sm font-semibold transition-colors flex items-center h-[calc(100%-8px)]", 
                 copied ? "bg-[#23A559] text-white" : "bg-[#5865F2] hover:bg-[#4752C4] text-white"
               )}
             >
               {copied ? "Copied" : "Copy"}
             </button>
           </div>
        </div>

        <div className="text-xs text-[#949BA4] flex items-start gap-2 bg-[#2B2D31] p-3 rounded">
           <Info className="w-4 h-4 flex-shrink-0 text-[#B5BAC1]" />
           <div>Your invite link expires in 7 days. <span className="text-[#00A8FC] cursor-pointer hover:underline">Edit invite link.</span></div>
        </div>
      </div>
    </div>
  );
}
