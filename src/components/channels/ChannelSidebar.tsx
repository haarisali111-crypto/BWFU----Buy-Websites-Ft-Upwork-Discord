import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Hash, Volume2, Mic, Headphones, Settings, Plus, UserPlus, FolderPlus, CalendarPlus, Grid, Bell, Shield, EyeOff, BarChart2, Rocket, LogOut, Megaphone } from "lucide-react";
import { InviteModal } from "../modals/InviteModal";

interface ChannelSidebarProps {
  server: any;
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onOpenSettings: () => void;
  onOpenUserSettings: () => void;
  onOpenCreateChannel: (categoryId?: string) => void;
  onOpenCreateCategory: () => void;
  onLeaveServer: () => void;
  onOpenChannelSettings?: (channel: any) => void;
  currentUser: any;
}

export function ChannelSidebar({ server, activeChannelId, onSelectChannel, onOpenSettings, onOpenUserSettings, onOpenCreateChannel, onOpenCreateCategory, onLeaveServer, onOpenChannelSettings, currentUser }: ChannelSidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (!server) return <div className="w-[300px] bg-[#2B2D31] h-screen flex-shrink-0" />;

  const categories = server.channels?.reduce((acc: any, channel: any) => {
    const cat = channel.category || "GENERAL";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(channel);
    return acc;
  }, {}) || {};

  const allCategoryNames = Array.from(new Set([
    ...(server.categories || []),
    ...Object.keys(categories)
  ]));

  return (
    <div className="w-[240px] bg-[#2B2D31] h-screen flex flex-col flex-shrink-0 relative">
      <div 
        className="h-12 border-b border-[#1F2124] flex items-center justify-between px-4 font-semibold shadow-sm cursor-pointer hover:bg-[#35373C] transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="truncate">{server.name}</span>
        <ChevronDown className="w-5 h-5 text-[#949BA4]" />
      </div>

      {dropdownOpen && (
        <div className="absolute top-[52px] left-2 w-[224px] bg-[#111214] rounded flex flex-col p-2 shadow-xl z-50 text-sm font-medium animate-in fade-in zoom-in-95 duration-100 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
          <div className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center mb-1 transition-colors">
            Server Boost <Rocket className="w-4 h-4" />
          </div>
          <div className="h-[1px] bg-[#2B2D31] my-1 mx-2" />
          <div 
            className="text-[#00A8FC] hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center transition-colors"
            onClick={() => { setShowInviteModal(true); setDropdownOpen(false); }}
          >
            Invite People <UserPlus className="w-4 h-4" />
          </div>
          <div className="h-[1px] bg-[#2B2D31] my-1 mx-2" />
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { onOpenSettings(); setDropdownOpen(false); }}>
            Server Settings <Settings className="w-4 h-4" />
          </div>
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            Server Insights <BarChart2 className="w-4 h-4" />
          </div>
          <div className="h-[1px] bg-[#2B2D31] my-1 mx-2" />
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { onOpenCreateChannel(); setDropdownOpen(false); }}>
            Create Channel <Plus className="w-4 h-4" />
          </div>
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { onOpenCreateCategory(); setDropdownOpen(false); }}>
            Create Category <FolderPlus className="w-4 h-4" />
          </div>
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            Create Event <CalendarPlus className="w-4 h-4" />
          </div>
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            App Directory <Grid className="w-4 h-4" />
          </div>
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            Integrations <Settings className="w-4 h-4" />
          </div>
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            Audit Logs <Settings className="w-4 h-4" />
          </div>
          <div className="h-[1px] bg-[#2B2D31] my-1 mx-2" />
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            Notification Settings <Bell className="w-4 h-4" />
          </div>
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            Privacy Settings <Shield className="w-4 h-4" />
          </div>
          <div className="h-[1px] bg-[#2B2D31] my-1 mx-2" />
          <div className="hover:bg-[#5865F2] hover:text-white px-2 py-1.5 rounded cursor-pointer flex justify-between items-center text-[#DBDEE1] transition-colors" onClick={() => { setDropdownOpen(false); }}>
            Hide Muted Channels <EyeOff className="w-4 h-4" />
          </div>
          <div className="h-[1px] bg-[#2B2D31] my-1 mx-2" />
          <div className="hover:bg-[#DA373C] hover:text-white text-[#DA373C] px-2 py-1.5 rounded cursor-pointer flex justify-between items-center transition-colors" onClick={() => { onLeaveServer(); setDropdownOpen(false); }}>
            Leave Server <LogOut className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
        {allCategoryNames.map((category: any) => {
          const channels = categories[category] || [];
          return (
          <div key={category} className="mb-4">
            <div className="text-xs font-semibold text-[#949BA4] px-4 mb-[2px] flex items-center justify-between hover:text-[#DBDEE1] cursor-pointer group">
              <div className="flex items-center font-bold">
                 <ChevronDown className="w-3 h-3 mr-1" /> {category}
              </div>
              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onOpenCreateChannel(category); }} />
            </div>
            {channels.map((channel: any) => {
              const isActive = activeChannelId === channel.id;
              let Icon = Hash;
              if (channel.type === "voice") Icon = Volume2;
              if (channel.type === "announcement") Icon = Megaphone;

              return (
                <div 
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    "mx-2 px-2 py-1.5 rounded flex items-center justify-between cursor-pointer group mb-[2px] transition-colors relative",
                    isActive ? "bg-[#404249] text-white" : "text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1]"
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0 pr-4">
                    <Icon className="w-5 h-5 mr-1.5 opacity-60 flex-shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity absolute right-2 pl-2 h-full z-10">
                    <Settings 
                      className="w-4 h-4 text-[#B5BAC1] hover:text-[#DBDEE1] transition-colors drop-shadow-sm" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onOpenChannelSettings?.(channel); 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )})}
      </div>

      {/* User Area */}
      <div className="h-[52px] bg-[#232428] flex items-center px-2 flex-shrink-0">
        <div className="flex items-center hover:bg-[#35373C] p-1 rounded cursor-pointer flex-1 mr-2">
          <div className="w-8 h-8 rounded-full bg-[#1E1F22] overflow-hidden relative mr-2">
            <img src={currentUser?.avatar} alt="avatar" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#23A559] rounded-full border-[2px] border-[#232428]" />
          </div>
          <div className="flex flex-col text-sm truncate">
            <span className="font-semibold text-white leading-tight">{currentUser?.username}</span>
            <span className="text-xs text-[#949BA4] leading-tight mb-[2px]">Online</span>
          </div>
        </div>
        <div className="flex items-center text-[#949BA4]">
          <div className="p-1.5 hover:bg-[#35373C] hover:text-[#DBDEE1] rounded cursor-pointer">
            <Mic className="w-5 h-5" />
          </div>
          <div className="p-1.5 hover:bg-[#35373C] hover:text-[#DBDEE1] rounded cursor-pointer">
            <Headphones className="w-5 h-5" />
          </div>
          <div onClick={onOpenUserSettings} className="p-1.5 hover:bg-[#35373C] hover:text-[#DBDEE1] rounded cursor-pointer">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      {showInviteModal && (
        <InviteModal 
          channel={server.channels.find((c: any) => c.id === activeChannelId) || server.channels[0]} 
          server={server}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
