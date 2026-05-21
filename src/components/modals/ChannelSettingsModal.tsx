import React, { useState } from "react";
import { X, Hash, Lock, RefreshCw, Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelSettingsModalProps {
  channel: any;
  server: any;
  onClose: () => void;
}

const PERMISSION_TYPES = [
  // General Channel Permissions
  { id: 'viewChannel', name: 'View Channel', desc: 'Allows members to view this channel by default. Disabling this for @everyone will make this channel private.', category: 'General Channel Permissions' },
  { id: 'manageChannel', name: 'Manage Channel', desc: 'Allows members to change this channel\'s name, description and text settings.', category: 'General Channel Permissions' },
  { id: 'managePermissions', name: 'Manage Permissions', desc: 'Allows members to change this channel\'s permissions.', category: 'General Channel Permissions' },
  { id: 'manageWebhooks', name: 'Manage Webhooks', desc: 'Allows members to create, edit, and delete webhooks.', category: 'General Channel Permissions' },
  
  // Membership Permissions
  { id: 'createInvite', name: 'Create Invite', desc: 'Allows members to invite new people to this channel.', category: 'Membership Permissions' },
  
  // Text Channel Permissions
  { id: 'sendMessages', name: 'Send Messages', desc: 'Allows members to send messages in this channel.', category: 'Text Channel Permissions' },
  { id: 'sendMessagesInThreads', name: 'Send Messages in Threads', desc: 'Allows members to send messages in threads.', category: 'Text Channel Permissions' },
  { id: 'createPublicThreads', name: 'Create Public Threads', desc: 'Allows members to create public threads.', category: 'Text Channel Permissions' },
  { id: 'createPrivateThreads', name: 'Create Private Threads', desc: 'Allows members to create private threads.', category: 'Text Channel Permissions' },
  { id: 'embedLinks', name: 'Embed Links', desc: 'Allows members\' messages to contain embedded content.', category: 'Text Channel Permissions' },
  { id: 'attachFiles', name: 'Attach Files', desc: 'Allows members to attach files in this channel.', category: 'Text Channel Permissions' },
  { id: 'addReactions', name: 'Add Reactions', desc: 'Allows members to add new emoji reactions to a message.', category: 'Text Channel Permissions' },
  { id: 'useExternalEmoji', name: 'Use External Emoji', desc: 'Allows members to use emoji from other servers.', category: 'Text Channel Permissions' },
  { id: 'useExternalStickers', name: 'Use External Stickers', desc: 'Allows members to use stickers from other servers.', category: 'Text Channel Permissions' },
  { id: 'mentionEveryone', name: 'Mention @everyone, @here, and All Roles', desc: 'Allows members to use @everyone or @here.', category: 'Text Channel Permissions' },
  { id: 'manageMessages', name: 'Manage Messages', desc: 'Allows members to delete messages by other members or pin any message.', category: 'Text Channel Permissions' },
  { id: 'manageThreads', name: 'Manage Threads', desc: 'Allows members to rename, delete, and archive threads.', category: 'Text Channel Permissions' },
  { id: 'readMessageHistory', name: 'Read Message History', desc: 'Allows members to read previous messages sent in this channel.', category: 'Text Channel Permissions' },
  { id: 'sendTTSMessages', name: 'Send Text-to-Speech Messages', desc: 'Allows members to send text-to-speech messages.', category: 'Text Channel Permissions' },
  
  // Voice Channel Permissions
  { id: 'connect', name: 'Connect', desc: 'Allows members to join this channel.', category: 'Voice Channel Permissions' },
  { id: 'speak', name: 'Speak', desc: 'Allows members to talk in this channel.', category: 'Voice Channel Permissions' },
  { id: 'video', name: 'Video', desc: 'Allows members to share their video, screen share, or stream a game in this channel.', category: 'Voice Channel Permissions' },
  { id: 'useVoiceActivity', name: 'Use Voice Activity', desc: 'Allows members to speak without using Push-to-Talk.', category: 'Voice Channel Permissions' }
];

export function ChannelSettingsModal({ channel, server, onClose }: ChannelSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("Permissions");
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Default to @everyone role if it exists, otherwise get first role, otherwise fallback
  const everyoneRole = server?.roles?.find((r: any) => r.name === "@everyone") || { id: "everyone", name: "@everyone" };
  const [selectedRoleId, setSelectedRoleId] = useState(everyoneRole.id);
  
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [addedRoleIds, setAddedRoleIds] = useState<string[]>([everyoneRole.id]);

  // permissions configuration: { roleId: { permissionId: 'inherit' | 'allow' | 'deny' } }
  const [permissions, setPermissions] = useState<Record<string, Record<string, 'inherit' | 'allow' | 'deny'>>>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const tabs = ["Overview", "Permissions", "Invites", "Integrations", "UI Gradient"];

  const setPermission = (roleId: string, permId: string, value: 'inherit' | 'allow' | 'deny') => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] || {}),
        [permId]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const getPermission = (roleId: string, permId: string) => {
    return permissions[roleId]?.[permId] || 'inherit';
  };

  const currentRole = server?.roles?.find((r: any) => r.id === selectedRoleId) || everyoneRole;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-full max-w-full h-full flex font-sans text-[#DBDEE1]">
        
        {/* Sidebar */}
        <div className="w-[30%] bg-[#2B2D31] flex justify-end">
          <div className="w-full max-w-[218px] py-[60px] px-2.5 flex flex-col items-start h-full">
            <div className="px-2 mb-4">
              <div className="text-xs font-bold text-[#87909c] mb-1 uppercase bg-transparent text-left flex items-center gap-1">
                <Hash className="w-4 h-4" />
                {channel?.name}
              </div>
            </div>
            
            {tabs.map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded text-[15px] font-medium cursor-pointer mb-0.5",
                  activeTab === tab 
                    ? "bg-[#404249] text-white" 
                    : "text-[#B5BAC1] hover:bg-[#35373C] hover:text-[#DBDEE1]"
                )}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#313338] py-[60px] px-10 relative flex flex-col h-full h-screen overflow-y-auto custom-scrollbar">
          <div className="max-w-[700px] w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {activeTab === "Permissions" ? "Channel Permissions" : activeTab}
                </h2>
                {activeTab === "Permissions" && (
                  <p className="text-[14px] text-[#B5BAC1]">
                    Use permissions to customise who can do what in this channel.
                  </p>
                )}
              </div>
            </div>

            {activeTab === "Permissions" ? (
              <div className="space-y-6">
                {/* Sync Banner */}
                <div className="bg-[#2B2D31] p-4 rounded-lg flex items-center border border-[#1E1F22]">
                  <RefreshCw className="w-5 h-5 text-[#B5BAC1] mr-3" />
                  <span className="text-[15px] text-[#DBDEE1]">
                    Permissions synced with category: <strong>{channel?.category || "GENERAL"}</strong>
                  </span>
                </div>

                {/* Private Channel Toggle */}
                <div className="bg-[#2B2D31] p-5 rounded-lg border border-[#1E1F22] flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-5 h-5 text-[#B5BAC1]" />
                      <h3 className="text-base font-semibold text-white">Private Channel</h3>
                    </div>
                    <p className="text-[14px] text-[#B5BAC1]">
                      By making a channel private, only select members and roles will be able to view this channel.
                    </p>
                  </div>
                  <div 
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={cn(
                      "w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-200 mt-1",
                      isPrivate ? "bg-[#23A559]" : "bg-[#80848E]"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm",
                      isPrivate ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </div>

                {/* Advanced Permissions layout */}
                <div className="mt-8">
                  <div className="flex items-center mb-4 cursor-pointer">
                    <h3 className="text-[15px] font-bold text-white mr-1">Advanced permissions</h3>
                    <div className="text-[#B5BAC1]">▼</div>
                  </div>

                  <div className="flex gap-6 mt-4">
                    {/* Roles/Members Sidebar */}
                    <div className="w-[200px] flex-shrink-0">
                      <div className="flex items-center justify-between mb-2 relative">
                        <span className="text-[12px] font-bold text-[#87909c] uppercase">Roles/Members</span>
                        <div 
                          className="cursor-pointer hover:text-white text-[#B5BAC1]"
                          onClick={() => setShowRolePicker(!showRolePicker)}
                        >
                          <Plus className="w-4 h-4" />
                        </div>
                        
                        {showRolePicker && (
                           <div className="absolute top-full right-0 mt-1 w-48 bg-[#1E1F22] border border-[#2B2D31] rounded-lg shadow-xl z-10 overflow-hidden">
                             {server?.roles?.filter((r: any) => !addedRoleIds.includes(r.id)).map((role: any) => (
                               <div 
                                 key={role.id}
                                 className="px-3 py-2 cursor-pointer hover:bg-[#35373C]"
                                 onClick={() => {
                                   setAddedRoleIds(prev => [...prev, role.id]);
                                   setSelectedRoleId(role.id);
                                   setShowRolePicker(false);
                                 }}
                               >
                                 {role.name}
                               </div>
                             ))}
                             {server?.roles?.filter((r: any) => !addedRoleIds.includes(r.id)).length === 0 && (
                               <div className="px-3 py-2 text-xs text-[#949BA4]">No more roles</div>
                             )}
                           </div>
                        )}
                      </div>
                      
                      <div className="space-y-[2px]">
                        {addedRoleIds.map(rId => {
                          const role = server?.roles?.find((r: any) => r.id === rId) || everyoneRole;
                          return (
                            <div 
                              key={rId}
                              onClick={() => setSelectedRoleId(rId)}
                              className={cn(
                                "px-3 py-2 rounded text-[15px] font-medium flex items-center justify-between cursor-pointer",
                                selectedRoleId === rId ? "bg-[#404249] text-white" : "hover:bg-[#35373C] text-[#B5BAC1]"
                              )}
                            >
                              {role.name}
                            </div>
                          );
                        })}
                      </div>
                      
                      <p className="text-[12px] text-[#00A8FC] mt-4 font-medium cursor-pointer hover:underline">
                        Need help with permissions?
                      </p>
                    </div>

                    {/* Permissions list */}
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold text-white mb-4">Editing {currentRole?.name}</h3>
                      
                      {PERMISSION_TYPES.map(perm => (
                        <div key={perm.id} className="border-b border-[#3F4147] pb-4 mb-4">
                          <div className="flex justify-between items-start">
                            <div className="pr-4">
                              <div className="text-[15px] text-[#DBDEE1] font-medium mb-1">{perm.name}</div>
                              <div className="text-[14px] text-[#B5BAC1]">
                                {perm.desc}
                              </div>
                            </div>
                            <div className="flex items-center bg-[#2B2D31] rounded overflow-hidden mt-1 ml-4 shadow-sm border border-[#1E1F22] flex-shrink-0">
                              <div 
                                onClick={(e) => { e.stopPropagation(); setPermission(currentRole.id, perm.id, 'deny'); }}
                                className={cn(
                                  "p-2 cursor-pointer hover:bg-[#3F4147] transition-colors",
                                  getPermission(currentRole.id, perm.id) === 'deny' ? "bg-[#DA373C] text-white" : "text-[#DA373C] opacity-70 hover:opacity-100"
                                )}
                              ><X className="w-5 h-5 flex-shrink-0" /></div>
                              <div 
                                onClick={(e) => { e.stopPropagation(); setPermission(currentRole.id, perm.id, 'inherit'); }}
                                className={cn(
                                  "p-2 cursor-pointer hover:bg-[#3F4147] transition-colors border-l border-r border-[#1E1F22]",
                                  getPermission(currentRole.id, perm.id) === 'inherit' ? "bg-[#404249] text-white" : "bg-[#2B2D31] text-[#B5BAC1] opacity-70 hover:opacity-100"
                                )}
                              ><Minus className="w-5 h-5 flex-shrink-0" /></div>
                              <div 
                                onClick={(e) => { e.stopPropagation(); setPermission(currentRole.id, perm.id, 'allow'); }}
                                className={cn(
                                  "p-2 cursor-pointer hover:bg-[#3F4147] transition-colors",
                                  getPermission(currentRole.id, perm.id) === 'allow' ? "bg-[#23A559] text-white" : "text-[#23A559] opacity-70 hover:opacity-100"
                                )}
                              ><Check className="w-5 h-5 flex-shrink-0" /></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "UI Gradient" ? (
              <div className="flex flex-col h-[400px]">
                <h3 className="text-xl font-bold text-white mb-6">Channel Background UI Gradient</h3>
                <p className="text-[#949BA4] mb-6">Preview and assign a custom gradient for this channel's background theme.</p>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    "from-[#5865F2] to-[#EB459E]",
                    "from-[#FF73FA] to-[#0D00FF]",
                    "from-[#00F0FF] to-[#0057FF]",
                    "from-[#FF0000] to-[#FFE600]",
                    "from-[#11998e] to-[#38ef7d]",
                    "from-[#aa4b6b] via-[#6b6b83] to-[#3b8d99]"
                  ].map((grad, i) => (
                    <div 
                      key={i} 
                      className={cn("h-24 rounded-lg cursor-pointer hover:ring-2 ring-white transition-all bg-gradient-to-br", grad)}
                    />
                  ))}
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-[400px] opacity-70">
                <div className="text-xl font-bold mb-4">{activeTab}</div>
                <div className="text-[#949BA4]">This feature is under development.</div>
              </div>
            )}
            
            {unsavedChanges && (
              <div className="h-16 bg-[#111214] border-t border-[#1F2124] flex items-center justify-between px-6 animate-in fade-in slide-in-from-bottom absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[800px] rounded-lg z-50 shadow-2xl">
                <div className="text-white font-medium">Careful — you have unsaved changes!</div>
                <div className="flex items-center gap-4">
                  <div className="text-white text-sm cursor-pointer hover:underline" onClick={() => { setPermissions({}); setUnsavedChanges(false); }}>Reset</div>
                  <div className="bg-[#23A559] hover:bg-[#1a7a42] text-white px-6 py-2 rounded text-sm font-bold shadow-lg cursor-pointer transition-colors" onClick={() => setUnsavedChanges(false)}>Save Changes</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute top-[60px] right-[40px] flex flex-col items-center gap-2">
             <button onClick={onClose} className="w-9 h-9 rounded-full border-2 border-[#80848E] flex items-center justify-center text-[#80848E] hover:bg-[#80848E]/10 transition-colors">
               <X className="w-5 h-5" />
             </button>
             <span className="text-[#80848E] text-[13px] font-semibold uppercase">ESC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
