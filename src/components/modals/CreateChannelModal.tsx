import React, { useState } from "react";
import { X, Hash, Volume2, Megaphone, LayoutList, MonitorPlay, Smile } from "lucide-react";
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import { cn } from "@/lib/utils";

interface CreateChannelModalProps {
  onClose: () => void;
  onCreate: (name: string, type: string) => void;
}

export function CreateChannelModal({ onClose, onCreate }: CreateChannelModalProps) {
  const [channelType, setChannelType] = useState("text");
  const [channelName, setChannelName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const types = [
    { id: "text", name: "Text", icon: Hash, desc: "Send messages, images, GIFs, emoji, opinions, and puns" },
    { id: "voice", name: "Voice", icon: Volume2, desc: "Hang out together with voice, video, and screen share" },
    { id: "announcement", name: "Announcement", icon: Megaphone, desc: "Send important messages to read-only channels" },
    { id: "forum", name: "Forum", icon: LayoutList, desc: "Organized discussions for specific topics" },
    { id: "stage", name: "Stage", icon: MonitorPlay, desc: "Host a panel, podcast, or townhall" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-full max-w-[440px] rounded-lg shadow-2xl flex flex-col font-sans text-[#DBDEE1] scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-4 flex flex-col items-center justify-center relative">
          <h2 className="text-xl font-bold text-white mb-1">Create Channel</h2>
          <div className="text-xs text-[#949BA4]">in Text Channels</div>
          <button onClick={onClose} className="absolute right-4 top-4 text-[#949BA4] hover:text-[#DBDEE1]">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-2 flex flex-col gap-4 overflow-y-auto max-h-[400px] custom-scrollbar">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold uppercase text-[#B5BAC1]">Channel Type</label>
            <div className="flex flex-col gap-2">
              {types.map((type) => (
                <div 
                  key={type.id}
                  onClick={() => setChannelType(type.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded cursor-pointer transition-colors border",
                    channelType === type.id ? "bg-[#4752C4]/10 border-[#5865F2]" : "bg-[#2B2D31] border-transparent hover:bg-[#35373C]"
                  )}
                >
                  <type.icon className="w-6 h-6 text-[#949BA4]" />
                  <div className="flex flex-col flex-1 pl-1">
                    <div className="font-semibold text-white text-[15px]">{type.name}</div>
                    <div className="text-xs text-[#949BA4] leading-tight">{type.desc}</div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-[#5865F2] flex items-center justify-center">
                    {channelType === type.id && <div className="w-2.5 h-2.5 bg-[#5865F2] rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[12px] font-bold uppercase text-[#B5BAC1]">Channel Name</label>
            <div className="relative flex items-center bg-[#1E1F22] rounded overflow-hidden p-2">
              <Hash className="w-4 h-4 text-[#949BA4] ml-1 mr-2" />
              <input 
                type="text" 
                value={channelName}
                onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="new-channel" 
                className="bg-transparent text-white outline-none w-full text-base" 
                autoFocus
              />
              <Smile 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="w-5 h-5 text-[#949BA4] cursor-pointer hover:text-white" 
              />
              {showEmojiPicker && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] shadow-2xl bg-[#313338] p-2 rounded-lg border border-[#1E1F22]">
                   <div className="flex justify-between items-center mb-2 px-2">
                     <span className="font-bold text-white text-sm">Pick Emoji</span>
                     <X className="w-4 h-4 cursor-pointer text-[#B5BAC1] hover:text-white" onClick={() => setShowEmojiPicker(false)} />
                   </div>
                   <EmojiPicker 
                     onEmojiClick={(emojiObject) => {
                       setChannelName(prev => (prev + emojiObject.emoji).toLowerCase().replace(/\s+/g, '-'));
                       setShowEmojiPicker(false);
                     }} 
                     theme={Theme.DARK} 
                     emojiStyle={EmojiStyle.TWITTER}
                     width={320}
                     height={400}
                   />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#2B2D31] rounded-b-lg flex items-center justify-between mt-2">
          <div className="text-sm font-medium text-white cursor-pointer hover:underline" onClick={onClose}>Cancel</div>
          <button 
            disabled={!channelName.trim()}
            onClick={() => onCreate(channelName, channelType)}
            className="bg-[#5865F2] text-white px-6 py-2 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4752C4] transition-colors"
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
}
