import React, { useState } from "react";
import {
  X,
  Users,
  Gem,
  GripVertical,
  Settings,
  Plus,
  Check,
  Smile,
  BarChart2,
  DollarSign,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";

interface ServerSettingsModalProps {
  server: any;
  onClose: () => void;
  onUpdateServer?: (serverId: string, updates: any) => void;
}

const PERMISSION_GROUPS = [
  {
    name: "General Server Permissions",
    permissions: [
      {
        id: "VIEW_CHANNEL",
        name: "View Channels",
        desc: "Allows members to view channels by default (excluding private channels).",
      },
      {
        id: "MANAGE_CHANNELS",
        name: "Manage Channels",
        desc: "Allows members to create, edit, or delete channels.",
      },
      {
        id: "MANAGE_ROLES",
        name: "Manage Roles",
        desc: "Allows members to create new roles and edit or delete roles lower than their highest role.",
      },
      {
        id: "MANAGE_SERVER",
        name: "Manage Server",
        desc: "Allows members to change this server's name, switch regions, and view audit logs.",
      },
      {
        id: "VIEW_AUDIT_LOG",
        name: "View Audit Log",
        desc: "Allows members to view a record of who made which changes in this server.",
      },
    ],
  },
  {
    name: "Membership Permissions",
    permissions: [
      {
        id: "KICK_MEMBERS",
        name: "Kick Members",
        desc: "Allows members to remove other members from this server. Kicked members will be able to rejoin if they have another invite.",
      },
      {
        id: "BAN_MEMBERS",
        name: "Ban Members",
        desc: "Allows members to permanently ban other members from this server.",
      },
      {
        id: "TIMEOUT_MEMBERS",
        name: "Timeout Members",
        desc: "Allows members to prevent other members from sending messages and speaking in voice channels.",
      },
      {
        id: "MANAGE_NICKNAMES",
        name: "Manage Nicknames",
        desc: "Allows members to change the nicknames of other members.",
      },
    ],
  },
  {
    name: "Text Channel Permissions",
    permissions: [
      {
        id: "SEND_MESSAGES",
        name: "Send Messages",
        desc: "Allows members to send text messages in channels.",
      },
      {
        id: "MANAGE_MESSAGES",
        name: "Manage Messages",
        desc: "Allows members to delete messages by other members or pin any message.",
      },
      {
        id: "EMBED_LINKS",
        name: "Embed Links",
        desc: "Allows links shared by members to show embedded content.",
      },
      {
        id: "ATTACH_FILES",
        name: "Attach Files",
        desc: "Allows members to upload files and media in channels.",
      },
      {
        id: "MENTION_EVERYONE",
        name: "Mention @everyone, @here, and All Roles",
        desc: "Allows members to use @everyone or @here to mention all members in a channel.",
      },
    ],
  },
  {
    name: "Voice Channel Permissions",
    permissions: [
      {
        id: "CONNECT",
        name: "Connect",
        desc: "Allows members to join voice channels and hear others.",
      },
      {
        id: "SPEAK",
        name: "Speak",
        desc: "Allows members to talk in voice channels.",
      },
      {
        id: "MUTE_MEMBERS",
        name: "Mute Members",
        desc: "Allows members to mute other members in voice channels.",
      },
      {
        id: "DEAFEN_MEMBERS",
        name: "Deafen Members",
        desc: "Allows members to deafen other members in voice channels.",
      },
      {
        id: "MOVE_MEMBERS",
        name: "Move Members",
        desc: "Allows members to move other members between voice channels.",
      },
    ],
  },
  {
    name: "Advanced Permissions",
    permissions: [
      {
        id: "ADMINISTRATOR",
        name: "Administrator",
        desc: "Members with this permission have every permission and also bypass channel specific permissions. This is a dangerous permission to grant.",
        danger: true,
      },
    ],
  },
];

export function ServerSettingsModal({
  server,
  onClose,
  onUpdateServer,
}: ServerSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("Roles");

  // Drag and drop state for roles
  const [roles, setRoles] = useState(
    server.roles?.length
      ? server.roles
      : [
          {
            id: "r1",
            name: "Owner",
            color: "#F1C40F",
            permissions: ["ADMINISTRATOR"],
            hoist: true,
            mentionable: true,
          },
          {
            id: "r2",
            name: "Moderator",
            color: "#2ECC71",
            permissions: ["KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_MESSAGES"],
            hoist: true,
            mentionable: false,
          },
          {
            id: "r3",
            name: "Member",
            color: "#99AAB5",
            permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "CONNECT", "SPEAK"],
            hoist: false,
            mentionable: false,
          },
        ],
  );

  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id);
  const selectedRole =
    roles.find((r: any) => r.id === selectedRoleId) || roles[0];

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showRoleEmojiPicker, setShowRoleEmojiPicker] = useState(false);

  const [serverName, setServerName] = useState(server.name);
  const [serverIcon, setServerIcon] = useState(server.icon);
  const overviewFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOverviewImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServerIcon(reader.result as string);
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(roles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRoles(items);
    setUnsavedChanges(true);
  };

  const updateSelectedRole = (updates: any) => {
    setRoles(
      roles.map((r: any) =>
        r.id === selectedRoleId ? { ...r, ...updates } : r,
      ),
    );
    setUnsavedChanges(true);
  };

  const togglePermission = (permId: string) => {
    const currentPerms = selectedRole.permissions || [];
    const newPerms = currentPerms.includes(permId)
      ? currentPerms.filter((p: string) => p !== permId)
      : [...currentPerms, permId];
    updateSelectedRole({ permissions: newPerms });
  };

  const handleCreateRole = () => {
    const newRole = {
      id: `r${Date.now()}`,
      name: "New Role",
      color: "#99AAB5",
      permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "CONNECT", "SPEAK"],
      hoist: false,
      mentionable: false,
    };
    setRoles([...roles, newRole]);
    setSelectedRoleId(newRole.id);
  };

  const tabs = [
    { name: "Overview" },
    { name: "Roles" },
    { name: "Emoji" },
    { name: "Stickers" },
    { name: "Soundboard" },
    { name: "Server Insights", icon: BarChart2 },
    { divider: true },
    { name: "Monetization", icon: DollarSign, color: "text-[#2ECC71]" },
    { name: "Subscriptions" },
    { divider: true },
    { name: "Security & Trust", icon: Shield },
    { name: "Safety Setup" },
    { name: "AutoMod" },
    { name: "Audit Log" },
    { name: "Bans" },
    { divider: true },
    { name: "Server Brain", icon: Sparkles, color: "text-[#5865F2]" },
    { divider: true },
    { name: "Members" },
    { name: "Invites" },
    { divider: true },
    { name: "Server Boost Status", icon: Gem, color: "text-[#FF73FA]" },
  ];

  return (
    <div className="fixed inset-0 bg-[#313338] text-[#DBDEE1] flex z-50 animate-in fade-in duration-200 font-sans">
      {/* Sidebar Settings (Left) */}
      <div className="w-1/3 min-w-[232px] max-w-[232px] flex-grow flex justify-end bg-[#2B2D31] flex-shrink-0">
        <div className="w-full max-w-[232px] h-full flex flex-col pt-14 pb-4 overflow-y-auto">
          <div className="px-6 py-4 text-[12px] font-bold text-[#949BA4] uppercase tracking-wider">
            {server.name}
          </div>
          <div className="px-4 flex flex-col gap-[2px]">
            {tabs.map((tab, i) => {
              if (tab.divider) {
                return (
                  <div key={i} className="h-[1px] bg-[#35363C] mx-4 my-2" />
                );
              }
              const isActive = activeTab === tab.name;
              return (
                <div
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name as string)}
                  className={cn(
                    "px-3 py-[6px] rounded cursor-pointer flex items-center justify-between group text-[15px] transition-colors gap-2",
                    isActive
                      ? "bg-[#3F4147] text-white font-medium"
                      : "text-[#949BA4] hover:bg-[#35373C]",
                    tab.color || "",
                  )}
                >
                  <div className="flex items-center">{tab.name}</div>
                  {tab.icon && (
                    <tab.icon className={cn("w-4 h-4", tab.color)} />
                  )}
                  {isActive && !tab.icon && tab.name === "Roles" && (
                    <div className="w-1 h-4 bg-[#5865F2] rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content (Right) */}
      <div className="flex-1 min-w-[460px] pt-14 pb-0 relative bg-[#313338] flex flex-col overflow-hidden">
        {/* Close Button */}
        <div className="absolute top-14 right-10 flex flex-col items-center z-50">
          <div
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-[#949BA4] flex items-center justify-center text-[#949BA4] hover:bg-[#35373C] hover:text-white cursor-pointer transition-colors mb-1"
          >
            <X className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#949BA4]">ESC</span>
        </div>

        {/* Dynamic Content based on Active Tab */}
        {activeTab === "Overview" && (
          <div className="max-w-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full">
            <h2 className="text-xl font-bold text-white mb-6">
              Server Overview
            </h2>

            <div className="flex gap-6 mb-8">
              <div className="flex flex-col">
                <input
                  type="file"
                  className="hidden"
                  ref={overviewFileInputRef}
                  accept="image/*"
                  onChange={handleOverviewImageUpload}
                />
                <div
                  onClick={() => overviewFileInputRef.current?.click()}
                  className="w-[100px] h-[100px] rounded-full border border-dashed border-gray-500 flex flex-col items-center justify-center cursor-pointer hover:bg-discord-hover bg-discord-active relative overflow-hidden group"
                >
                  {serverIcon ? (
                    <>
                      <img
                        src={serverIcon}
                        alt={serverName}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity"
                      />
                      <div className="absolute font-bold text-[10px] uppercase text-white shadow-sm flex flex-col items-center">
                        <Settings className="w-6 h-6 mb-1" />
                        Change
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-[10px] uppercase text-gray-300">
                        Upload
                      </div>
                      <div className="font-bold text-[10px] uppercase text-gray-300">
                        Image
                      </div>
                    </>
                  )}
                  <span className="absolute top-0 right-0 bg-discord-brand w-6 h-6 rounded-bl flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 text-center mt-2 w-[100px]">
                  Minimum Size: 128x128
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-bold text-gray-300 uppercase mb-2 block">
                  Server Name
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => {
                    setServerName(e.target.value);
                    setUnsavedChanges(true);
                  }}
                  className="w-full bg-discord-sidebar p-2.5 rounded border border-[#1e1f22] focus:border-blue-500 outline-none text-gray-200 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Roles" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full flex flex-col w-full absolute inset-0 pt-14">
            {/* Header */}
            <div className="h-12 border-b border-[#1F2124] flex items-center px-10 justify-between shadow-sm flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase text-[12px]">
                  {server.name}
                </span>
                <span className="text-[#949BA4] font-light">/</span>
                <span className="font-medium text-white text-[15px]">
                  Roles
                </span>
              </div>
              <div className="flex items-center gap-4 mr-20">
                <div className="bg-[#1E1F22] rounded px-2 py-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent text-sm outline-none border-none w-24 text-[#DBDEE1]"
                  />
                  <svg
                    className="w-4 h-4 text-[#949BA4]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div
                  className="bg-[#5865F2] text-white px-3 py-1.5 rounded text-[13px] font-medium cursor-pointer hover:bg-[#4752C4]"
                  onClick={handleCreateRole}
                >
                  Create Role
                </div>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Roles List */}
              <div className="w-[300px] border-r border-[#3F4147] flex flex-col p-4 gap-4 px-10 overflow-y-auto">
                <div className="text-[#949BA4] text-[12px] font-bold uppercase tracking-tighter">
                  Roles — {roles.length}
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="roles" direction="vertical">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-1"
                      >
                        {roles.map((role: any, index: number) => {
                          const draggableProps: any = {
                            key: role.id,
                            draggableId: role.id,
                            index: index,
                          };
                          return (
                            <Draggable {...draggableProps}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  onClick={() => setSelectedRoleId(role.id)}
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded cursor-pointer group transition-colors",
                                    selectedRoleId === role.id
                                      ? "bg-[#3F4147]"
                                      : "hover:bg-[#35373C]",
                                    snapshot.isDragging &&
                                      "shadow-lg bg-[#3F4147] ring-1 ring-[#5865F2] z-50",
                                  )}
                                  style={{
                                    ...provided.draggableProps.style,
                                    borderLeft: `4px solid ${role.color || "#99AAB5"}`,
                                  }}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "cursor-grab active:cursor-grabbing",
                                      selectedRoleId === role.id
                                        ? "text-[#B5BAC1]"
                                        : "text-[#4E5058] opacity-0 group-hover:opacity-100 transition-opacity",
                                    )}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M7 6h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                                    </svg>
                                  </div>
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: role.color || "#99AAB5",
                                    }}
                                  />
                                  <span
                                    className={cn(
                                      "text-sm truncate",
                                      selectedRoleId === role.id
                                        ? "font-medium text-white"
                                        : "text-[#DBDEE1]",
                                    )}
                                  >
                                    {role.emoji && (
                                      <span className="mr-1">{role.emoji}</span>
                                    )}
                                    {role.name}
                                  </span>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Role Edit Preview Area */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative pr-[120px]">
                <div className="max-w-[600px] pb-24">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="text-xl font-bold text-white truncate">
                      Edit Role — {selectedRole?.name || "Role"}
                    </div>
                    <div className="flex-1 h-[1px] bg-[#3F4147]"></div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Role Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold uppercase text-[#B5BAC1]">
                        Role Name
                      </label>
                      <input
                        type="text"
                        value={selectedRole.name}
                        onChange={(e) =>
                          updateSelectedRole({ name: e.target.value })
                        }
                        className="bg-[#1E1F22] p-2.5 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none text-white w-full"
                      />
                    </div>

                    {/* Role Color */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold uppercase text-[#B5BAC1]">
                        Role Color
                      </label>
                      <div className="grid grid-cols-10 gap-2 mt-2">
                        {[
                          "#1ABC9C",
                          "#2ECC71",
                          "#3498DB",
                          "#9B59B6",
                          "#E91E63",
                          "#F1C40F",
                          "#E67E22",
                          "#E74C3C",
                          "#95A5A6",
                          "#607D8B",
                        ].map((color) => (
                          <div
                            key={color}
                            onClick={() => updateSelectedRole({ color })}
                            className={cn(
                              "w-8 h-8 rounded cursor-pointer transition-all",
                              selectedRole.color === color
                                ? "ring-2 ring-offset-2 ring-offset-[#313338]"
                                : "hover:scale-110",
                            )}
                            style={
                              {
                                backgroundColor: color,
                                "--tw-ring-color": color,
                              } as any
                            }
                          ></div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="w-20 h-10 rounded border-2 border-dashed border-[#4E5058] flex items-center justify-center text-xs text-[#949BA4]">
                          Custom
                        </div>
                        <div className="flex-1 p-2 bg-[#1E1F22] rounded flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor: selectedRole.color ?? "#99AAB5",
                            }}
                          ></div>
                          <span className="text-sm text-[#B5BAC1]">
                            {selectedRole.color ?? "#99AAB5"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Icon */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold uppercase text-[#B5BAC1]">
                        Role Icon
                      </label>
                      <div className="flex items-center gap-4 mt-2">
                        {/* Display Current Icon */}
                        {selectedRole.emoji || selectedRole.icon ? (
                          <div className="relative group">
                            <div className="w-16 h-16 rounded border border-dashed border-[#4E5058] flex items-center justify-center bg-[#2B2D31]">
                              {selectedRole.icon ? (
                                <img
                                  src={selectedRole.icon}
                                  alt="role icon"
                                  className="w-10 h-10 object-contain rounded"
                                />
                              ) : (
                                <span className="text-3xl leading-none">
                                  {selectedRole.emoji}
                                </span>
                              )}
                            </div>
                            <div
                              className="absolute -top-2 -right-2 bg-[#F23F43] hover:bg-[#DA373C] text-white p-1 rounded-full cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove Icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSelectedRole({ emoji: null, icon: null });
                              }}
                            >
                              <X className="w-3 h-3" />
                            </div>
                          </div>
                        ) : null}

                        {/* Image Upload Button */}
                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            className="hidden"
                            id="role-icon-upload"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const r = new FileReader();
                                r.onload = () =>
                                  updateSelectedRole({
                                    icon: r.result,
                                    emoji: null,
                                  });
                                r.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="role-icon-upload"
                            className="w-[140px] px-3 py-2 rounded bg-[#4E5058] hover:bg-[#6D6F78] text-white text-sm font-medium cursor-pointer transition-colors text-center shadow"
                          >
                            Choose Image
                          </label>

                          {/* Emoji Picker Button */}
                          <div className="relative">
                            <div
                              onClick={() =>
                                setShowRoleEmojiPicker(!showRoleEmojiPicker)
                              }
                              className="w-[140px] px-3 py-2 rounded border border-[#4E5058] text-[#DBDEE1] hover:bg-[#35373C] flex items-center justify-center gap-2 text-sm font-medium cursor-pointer transition-colors"
                            >
                              <Smile className="w-4 h-4 text-[#B5BAC1]" />{" "}
                              Choose Emoji
                            </div>
                            {showRoleEmojiPicker && (
                              <div
                                className="absolute top-12 left-0 z-[100] shadow-2xl bg-[#313338] p-2 rounded-lg border border-[#1E1F22]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-between items-center mb-2 px-2">
                                  <span className="font-bold text-white text-sm">
                                    Pick Role Icon
                                  </span>
                                  <X
                                    className="w-4 h-4 cursor-pointer text-[#B5BAC1] hover:text-white"
                                    onClick={() =>
                                      setShowRoleEmojiPicker(false)
                                    }
                                  />
                                </div>
                                <EmojiPicker
                                  onEmojiClick={(emojiObject) => {
                                    updateSelectedRole({
                                      emoji: emojiObject.emoji,
                                      icon: null,
                                    });
                                    setShowRoleEmojiPicker(false);
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

                        <div className="text-xs text-[#949BA4] max-w-[200px] ml-2 leading-relaxed">
                          Choose an image or emoji to represent this role next
                          to member names.
                        </div>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="h-[1px] bg-[#3F4147] my-2"></div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">
                            Display role members separately from online members
                          </div>
                          <div className="text-xs text-[#949BA4]">
                            Group members by this role in the member list
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            updateSelectedRole({ hoist: !selectedRole.hoist })
                          }
                          className={cn(
                            "w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200",
                            selectedRole.hoist
                              ? "bg-[#23A559]"
                              : "bg-[#4E5058]",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow",
                              selectedRole.hoist ? "right-1" : "left-1",
                            )}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">
                            Allow anyone to @mention this role
                          </div>
                          <div className="text-xs text-[#949BA4]">
                            Allows members to mention all members in this role
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            updateSelectedRole({
                              mentionable: !selectedRole.mentionable,
                            })
                          }
                          className={cn(
                            "w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200",
                            selectedRole.mentionable
                              ? "bg-[#23A559]"
                              : "bg-[#4E5058]",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow",
                              selectedRole.mentionable ? "right-1" : "left-1",
                            )}
                          ></div>
                        </div>
                      </div>

                      {/* Role Icon (Nitro) */}
                      <div className="p-4 rounded-lg bg-gradient-to-r from-[#FF73FA] to-[#5865F2] bg-opacity-20 flex items-center justify-between border border-[#FF73FA]/30 mt-2">
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                          </svg>
                          <div>
                            <div className="text-white font-bold">
                              Custom Role Icon
                            </div>
                            <div className="text-[11px] text-white/80">
                              Unlock unique icons for your members by boosting
                              this server.
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-1.5 flex-shrink-0 bg-white text-[#5865F2] rounded font-bold text-xs cursor-pointer shadow-lg hover:bg-gray-100">
                          BOOST NOW
                        </div>
                      </div>
                    </div>

                    {/* Permissions Header */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[12px] font-bold uppercase text-[#B5BAC1]">
                        Permissions
                      </div>
                      <div
                        className="text-[#00A8FC] text-xs font-medium cursor-pointer hover:underline"
                        onClick={() => updateSelectedRole({ permissions: [] })}
                      >
                        Clear Permissions
                      </div>
                    </div>

                    {PERMISSION_GROUPS.map((group, gIdx) => (
                      <div key={gIdx} className="mb-6">
                        <div className="text-xs font-bold text-[#B5BAC1] uppercase mb-4">
                          {group.name}
                        </div>
                        <div className="bg-[#1E1F22] rounded p-4 flex flex-col gap-4">
                          {group.permissions.map((perm) => {
                            const isAllowed =
                              selectedRole.permissions?.includes(perm.id);
                            return (
                              <div
                                key={perm.id}
                                className="flex items-center justify-between border-b border-[#35363C] pb-4 last:border-0 last:pb-0"
                              >
                                <div className="flex-1 pr-4">
                                  <div
                                    className={cn(
                                      "text-sm font-medium",
                                      perm.danger
                                        ? "text-[#DA373C]"
                                        : "text-white",
                                    )}
                                  >
                                    {perm.name}
                                  </div>
                                  <div className="text-[11px] text-[#949BA4]">
                                    {perm.desc}
                                  </div>
                                </div>
                                <div
                                  onClick={() => togglePermission(perm.id)}
                                  className={cn(
                                    "w-10 h-6 rounded-full relative flex-shrink-0 cursor-pointer transition-colors duration-200",
                                    isAllowed ? "bg-[#23A559]" : "bg-[#4E5058]",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow",
                                      isAllowed ? "right-1" : "left-1",
                                    )}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Footer (Discord-style save bar) */}
            {unsavedChanges && (
              <div className="h-16 bg-[#111214] border-t border-[#1F2124] flex items-center justify-between px-6 animate-in fade-in slide-in-from-bottom absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[800px] rounded-lg z-50 shadow-2xl">
                <div className="text-white font-medium">
                  Careful — you have unsaved changes!
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="text-white text-sm cursor-pointer hover:underline"
                    onClick={() => {
                      setRoles(server.roles || []);
                      setServerName(server.name);
                      setServerIcon(server.icon);
                      setUnsavedChanges(false);
                    }}
                  >
                    Reset
                  </div>
                  <div
                    className="bg-[#23A559] hover:bg-[#1a7a42] text-white px-6 py-2 rounded text-sm font-bold shadow-lg cursor-pointer transition-colors"
                    onClick={() => {
                      if (onUpdateServer) {
                        onUpdateServer(server.id, {
                          roles,
                          name: serverName,
                          icon: serverIcon,
                        });
                      }
                      setUnsavedChanges(false);
                    }}
                  >
                    Save Changes
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Invites" && (
          <div className="max-w-[740px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full">
            <h2 className="text-xl font-bold text-white mb-6">Invites</h2>
            <p className="text-sm text-gray-300 mb-6">
              Here's a list of all active invite links for this server. You can
              revoke any of them.
            </p>

            <div className="bg-discord-sidebar rounded border border-discord-divider overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-4 font-semibold text-gray-400 text-sm border-b border-discord-divider">
                <div>INVITER</div>
                <div>INVITE CODE</div>
                <div>USES</div>
                <div>EXPIRES</div>
              </div>

              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-4 p-4 border-b border-discord-divider last:border-0 items-center hover:bg-discord-hover transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500 mr-2" />
                    <span className="text-sm text-white">Luminia Ai</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    discord.gg/lum{i}x9A
                  </div>
                  <div className="text-sm text-gray-400">{i * 12}/∞</div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    Never
                    <X className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "Server Boost Status" && (
          <div className="max-w-[740px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full">
            <div className="flex items-center mb-6">
              <Gem className="w-8 h-8 text-[#FF73FA] mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Server Boost Status
              </h2>
            </div>

            <div className="bg-gradient-to-r from-[#FF73FA]/20 to-[#5865F2]/20 border border-[#FF73FA]/30 rounded-xl p-8 text-center flex flex-col items-center mb-8 relative overflow-hidden">
              <div className="absolute -left-12 -top-12 opacity-10">
                <Gem className="w-48 h-48 text-[#FF73FA]" />
              </div>
              <div className="absolute -right-12 -bottom-12 opacity-10">
                <Gem className="w-48 h-48 text-[#FF73FA]" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-2 z-10 flex items-center gap-3">
                <Gem className="w-8 h-8 text-[#FF73FA]" /> Level 3 Unlocked{" "}
                <Gem className="w-8 h-8 text-[#FF73FA]" />
              </h3>
              <p className="text-[#DBDEE1] mb-6 max-w-md z-10 font-medium text-[15px]">
                This server has unlocked all Server Boost Perks! Enjoy highest
                quality audio, vanity URL, and maximum emoji slots.
              </p>
              <div className="bg-[#FF73FA] hover:bg-[#d65ecc] text-white font-bold py-3 px-8 rounded transition-colors cursor-pointer w-fit z-10">
                Boost This Server
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
              <div className="bg-[#1E1F22] rounded-lg border border-[#35363C] flex flex-col relative overflow-hidden group">
                <div className="h-2 bg-[#FF73FA]/30 group-hover:bg-[#FF73FA]/50 transition-colors w-full" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="font-bold text-[#FF73FA] mb-1 text-lg">
                    Level 1
                  </div>
                  <div className="text-sm font-semibold text-white mb-4">
                    2 Server Boosts
                  </div>
                  <ul className="text-[13px] text-[#DBDEE1] space-y-2 flex-1 relative z-10">
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      +50 Emoji Slots (for a total of 100)
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      128 Kbps Audio Quality
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      Custom Role Icons
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1E1F22] rounded-lg border border-[#35363C] flex flex-col relative overflow-hidden group">
                <div className="h-2 bg-[#FF73FA]/60 group-hover:bg-[#FF73FA]/80 transition-colors w-full" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="font-bold text-[#FF73FA] mb-1 text-lg">
                    Level 2
                  </div>
                  <div className="text-sm font-semibold text-white mb-4">
                    7 Server Boosts
                  </div>
                  <ul className="text-[13px] text-[#DBDEE1] space-y-2 flex-1 relative z-10">
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      +50 Emoji Slots (for a total of 150)
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      256 Kbps Audio Quality
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      Server Banner
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      50MB Upload Limit for all members
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1E1F22] rounded-lg border border-[#FF73FA] flex flex-col relative overflow-hidden group shadow-[0_0_15px_rgba(255,115,250,0.15)] ring-1 ring-[#FF73FA]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF73FA]/10 to-transparent pointer-events-none" />
                <div className="h-2 bg-[#FF73FA] w-full shadow-[0_0_10px_#FF73FA]" />
                <div className="p-5 flex-1 flex flex-col relative z-10">
                  <div className="font-bold text-[#FF73FA] mb-1 text-lg flex items-center justify-between">
                    Level 3{" "}
                    <div className="bg-[#FF73FA] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Unlocked
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white mb-4">
                    14 Server Boosts
                  </div>
                  <ul className="text-[13px] text-[#DBDEE1] space-y-2 flex-1">
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      +100 Emoji Slots (for a total of 250)
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      384 Kbps Audio Quality
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      Vanity URL
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#23A559] flex-shrink-0 mt-0.5" />{" "}
                      100MB Upload Limit for all members
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Server Insights" && (
          <div className="max-w-[740px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full">
            <h2 className="text-xl font-bold text-white mb-6">
              Server Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#1E1F22] rounded-lg p-4 border border-[#35363C]">
                <div className="text-[#949BA4] text-xs font-bold uppercase mb-1">
                  Total Members
                </div>
                <div className="text-2xl font-bold text-white">
                  {server.members?.length || 1}
                </div>
                <div className="text-[#2ECC71] text-xs mt-1">
                  ↑ 12% this week
                </div>
              </div>
              <div className="bg-[#1E1F22] rounded-lg p-4 border border-[#35363C]">
                <div className="text-[#949BA4] text-xs font-bold uppercase mb-1">
                  Active Today
                </div>
                <div className="text-2xl font-bold text-white">
                  {Math.max(1, Math.floor((server.members?.length || 1) * 0.4))}
                </div>
                <div className="text-[#2ECC71] text-xs mt-1">
                  ↑ 5% this week
                </div>
              </div>
              <div className="bg-[#1E1F22] rounded-lg p-4 border border-[#35363C]">
                <div className="text-[#949BA4] text-xs font-bold uppercase mb-1">
                  Messages Sent
                </div>
                <div className="text-2xl font-bold text-white">1,204</div>
                <div className="text-red-400 text-xs mt-1">↓ 2% this week</div>
              </div>
            </div>

            <div className="bg-[#1E1F22] rounded-lg p-6 border border-[#35363C] mb-8 h-64 flex flex-col items-center justify-center">
              <BarChart2 className="w-16 h-16 text-[#35363C] mb-4" />
              <div className="text-[#949BA4] font-medium">
                Growth chart generation requires adequate data history
              </div>
              <div className="text-[#949BA4] text-sm">
                Check back next week!
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">
              Moderation Activity Log
            </h3>
            <div className="bg-[#1E1F22] rounded-lg border border-[#35363C] overflow-hidden">
              {[
                {
                  a: "haaris.ali.111",
                  b: "banned user123",
                  c: "Spam",
                  d: "2 hrs ago",
                },
                {
                  a: "AutoMod",
                  b: "deleted message from Spambot",
                  c: "Phishing link detected",
                  d: "5 hrs ago",
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex p-4 border-b border-[#35363C] last:border-0 hover:bg-[#2B2D31] transition-colors"
                >
                  <div className="flex-1 text-[#DBDEE1] text-sm">
                    <span className="font-bold text-white">{log.a}</span>{" "}
                    {log.b}
                  </div>
                  <div className="flex-1 text-[#949BA4] text-sm">{log.c}</div>
                  <div className="text-[#949BA4] text-xs">{log.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Monetization" && (
          <div className="max-w-[740px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-[#2ECC71]" /> Monetize Your
              Server
            </h2>
            <p className="text-[#DBDEE1] mb-8 font-medium">
              Earn revenue directly from your community through paid
              subscriptions, premium channels, and one-time tips.
            </p>

            <div className="bg-gradient-to-br from-[#2ECC71]/20 to-[#1E1F22] border border-[#2ECC71]/30 rounded-lg p-6 mb-8 relative overflow-hidden">
              <DollarSign className="w-40 h-40 text-[#2ECC71]/10 absolute -right-10 -bottom-10" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">
                  Enable Server Subscriptions
                </h3>
                <p className="text-[#949BA4] text-sm mb-4 max-w-md">
                  Create subscription tiers to give members access to exclusive
                  channels, roles, and benefits.
                </p>
                <button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-4 py-2 rounded font-semibold transition-colors">
                  Set up Stripe Connect
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E1F22] rounded-lg p-5 border border-[#35363C]">
                <div className="font-bold text-white mb-1">Server Shop</div>
                <div className="text-[#949BA4] text-sm mb-4">
                  Sell digital products or roles
                </div>
                <button className="w-full bg-[#35363C] hover:bg-[#404249] text-white py-2 rounded font-medium transition-colors">
                  Manage Products
                </button>
              </div>
              <div className="bg-[#1E1F22] rounded-lg p-5 border border-[#35363C]">
                <div className="font-bold text-white mb-1">
                  Tipping & Boosts
                </div>
                <div className="text-[#949BA4] text-sm mb-4">
                  Allow users to tip messages
                </div>
                <button className="w-full bg-[#35363C] hover:bg-[#404249] text-white py-2 rounded font-medium transition-colors">
                  Configure Tipping
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Security & Trust" && (
          <div className="max-w-[740px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#FEE75C]" /> Security & Trust
            </h2>

            <div className="space-y-6">
              <div className="bg-[#1E1F22] rounded-lg p-5 border border-[#35363C] flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-lg">
                    Anti-Raid Protection (AI)
                  </div>
                  <div className="text-[#949BA4] text-sm mt-1">
                    Automatically blocks sudden influx of suspicious accounts
                    based on IP tracking & behavior.
                  </div>
                </div>
                <div className="w-12 h-6 bg-[#5865F2] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1" />
                </div>
              </div>

              <div className="bg-[#1E1F22] rounded-lg p-5 border border-[#35363C] flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-lg">
                    2FA Requirement for Moderation
                  </div>
                  <div className="text-[#949BA4] text-sm mt-1">
                    Requires all users with ban/kick permissions to have
                    Two-Factor Authentication enabled.
                  </div>
                </div>
                <div className="w-12 h-6 bg-[#5865F2] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1" />
                </div>
              </div>

              <div className="bg-[#1E1F22] rounded-lg p-5 border border-[#35363C] flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-lg flex items-center gap-2">
                    End-to-End Encrypted Mode (E2EE){" "}
                    <span className="bg-[#5865F2] text-[10px] uppercase font-bold text-white px-1.5 py-0.5 rounded">
                      Beta
                    </span>
                  </div>
                  <div className="text-[#949BA4] text-sm mt-1 mb-2">
                    Enable military-grade encryption for direct messages and
                    specific secure channels.
                  </div>
                </div>
                <div className="w-12 h-6 bg-[#404249] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-[#949BA4] rounded-full absolute top-1 left-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Server Brain" && (
          <div className="max-w-[740px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5865F2] to-[#FF73FA]">
                Luminia AI Server Brain
              </span>
              <Sparkles className="w-6 h-6 text-[#FF73FA]" />
            </h2>
            <p className="text-[#DBDEE1] mb-8 font-medium">
              Turn your server into an intelligent autonomous community.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-b from-[#1E1F22] to-transparent rounded-lg p-5 border border-[#5865F2]/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/10 rounded-bl-full group-hover:bg-[#5865F2]/20 transition-colors" />
                <h3 className="font-bold text-white text-lg mb-2 relative z-10">
                  Smart Summaries
                </h3>
                <p className="text-[#949BA4] text-sm mb-4 relative z-10 h-10">
                  AI generates daily "TL;DR" catch-ups for users based on
                  channel activity.
                </p>
                <button className="bg-[#404249] hover:bg-[#5865F2] text-white px-4 py-2 rounded text-sm w-full font-medium transition-colors relative z-10">
                  Configure Model
                </button>
              </div>

              <div className="bg-gradient-to-b from-[#1E1F22] to-transparent rounded-lg p-5 border border-[#5865F2]/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/10 rounded-bl-full group-hover:bg-[#5865F2]/20 transition-colors" />
                <h3 className="font-bold text-white text-lg mb-2 relative z-10">
                  Auto-Onboarding
                </h3>
                <p className="text-[#949BA4] text-sm mb-4 relative z-10 h-10">
                  AI bot interviews new users in DMs to automatically assign
                  roles & intro them.
                </p>
                <button className="bg-[#404249] hover:bg-[#5865F2] text-white px-4 py-2 rounded text-sm w-full font-medium transition-colors relative z-10">
                  Edit Interview Script
                </button>
              </div>

              <div className="bg-gradient-to-b from-[#1E1F22] to-transparent rounded-lg p-5 border border-[#5865F2]/40 relative overflow-hidden group md:col-span-2">
                <h3 className="font-bold text-white text-lg mb-2 relative z-10">
                  Community Health Score
                </h3>
                <div className="flex items-center gap-4 mt-4">
                  <div className="w-24 h-24 rounded-full border-[6px] border-[#2ECC71] flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">92</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#949BA4] text-sm mb-2">
                      Based on sentiment analysis of 1.2k messages this week.
                    </p>
                    <ul className="text-sm list-disc pl-4 text-[#949BA4]">
                      <li>High positive engagement in #announcements</li>
                      <li>Spam detected and isolated effectively</li>
                      <li>
                        <span className="text-red-400">Suggestion:</span> Create
                        more active events.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {![
          "Overview",
          "Roles",
          "Invites",
          "Server Boost Status",
          "Server Insights",
          "Monetization",
          "Security & Trust",
          "Server Brain",
        ].includes(activeTab) && (
          <div className="max-w-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300 px-10 overflow-y-auto custom-scrollbar h-full flex flex-col pt-10">
            <h2 className="text-xl font-bold text-white mb-2">{activeTab}</h2>
            <p className="text-[#949BA4] text-[15px] mb-8">
              This section is currently under development. Here you will be able
              to customize {activeTab.toLowerCase()} settings for your server.
            </p>
            <div className="flex-1 w-full flex flex-col items-center justify-center opacity-30 mt-10">
              <Settings
                className="w-24 h-24 text-[#949BA4] mb-4 animate-spin-slow"
                style={{ animationDuration: "4s" }}
              />
              <div className="text-lg font-semibold text-[#949BA4]">
                Work in progress
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
