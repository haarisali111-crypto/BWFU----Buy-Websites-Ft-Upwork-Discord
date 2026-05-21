import React from "react";
import { X, MessageSquare, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileModalProps {
  user: any;
  currentUser?: any;
  server?: any;
  onClose: () => void;
  onSendMessage?: () => void;
  onUpdateMemberRoles?: (userId: string, roleIds: string[]) => void;
}

export function UserProfileModal({
  user,
  currentUser,
  server,
  onClose,
  onSendMessage,
  onUpdateMemberRoles,
}: UserProfileModalProps) {
  const [showRoleSelector, setShowRoleSelector] = React.useState(false);
  const selectorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setShowRoleSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canManageRoles = React.useMemo(() => {
    if (!server || !currentUser) return false;
    if (server.members?.[0]?.id === currentUser.id) return true; // Server owner
    const member = server.members?.find((m: any) => m.id === currentUser.id);
    if (!member) return false;
    const memberRoles =
      server.roles?.filter((r: any) => member.roles?.includes(r.id)) || [];
    return memberRoles.some(
      (r: any) =>
        r.permissions?.includes("ADMINISTRATOR") ||
        r.permissions?.includes("MANAGE_ROLES") ||
        r.permissions?.includes("BAN_MEMBERS") ||
        r.name === "Moderator",
    );
  }, [server, currentUser]);

  const userRoleIds = user.roles || [];

  const userRoles = React.useMemo(() => {
    if (!server || !server.roles) return [];
    return server.roles.filter((r: any) => userRoleIds.includes(r.id));
  }, [server, userRoleIds]);

  const availableRolesToAdd = React.useMemo(() => {
    if (!server || !currentUser) return [];
    const isOwner = server.members?.[0]?.id === currentUser.id;

    const currentUserRoleIndex = isOwner
      ? -1
      : (server.roles?.findIndex((r: any) => {
          const member = server.members?.find(
            (m: any) => m.id === currentUser.id,
          );
          return member?.roles?.includes(r.id);
        }) ?? server.roles.length);

    return (
      server.roles?.filter((r: any, idx: number) => {
        if (r.name === "@everyone") return false;
        if (userRoleIds.includes(r.id)) return false;
        if (!isOwner && idx <= currentUserRoleIndex) return false;
        return true;
      }) || []
    );
  }, [server, currentUser, userRoleIds]);

  const addRole = (roleId: string) => {
    if (onUpdateMemberRoles) {
      onUpdateMemberRoles(user.id, [...userRoleIds, roleId]);
    }
    setShowRoleSelector(false);
  };

  const removeRole = (roleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure user can remove role (check hierarchy)
    const isOwner = server.members?.[0]?.id === currentUser.id;
    const currentUserRoleIndex = isOwner
      ? -1
      : (server.roles?.findIndex((r: any) => {
          const member = server.members?.find(
            (m: any) => m.id === currentUser.id,
          );
          return member?.roles?.includes(r.id);
        }) ?? server.roles.length);
    const targetRoleIndex = server.roles?.findIndex(
      (r: any) => r.id === roleId,
    );

    if (!isOwner && targetRoleIndex <= currentUserRoleIndex) {
      return; // Can't remove a role higher or equal to yours
    }

    if (onUpdateMemberRoles) {
      onUpdateMemberRoles(
        user.id,
        userRoleIds.filter((id: string) => id !== roleId),
      );
    }
  };

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#2B2D31] w-full max-w-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden relative font-sans text-[#DBDEE1] scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-[120px] bg-gradient-to-r from-[#5865F2] to-[#EB459E] relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6 mt-[-40px]">
          {/* Avatar & Top Actions */}
          <div className="flex justify-between items-end mb-4">
            <div className="w-[120px] h-[120px] rounded-full border-8 border-[#2B2D31] bg-[#1E1F22] relative z-10 flex-shrink-0">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                }
                alt="avatar"
                className="w-full h-full rounded-full bg-[#1E1F22] object-cover"
              />
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#2B2D31] rounded-full flex items-center justify-center">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full",
                    (user.status || "online") === "online"
                      ? "bg-[#23A559]"
                      : user.status === "idle"
                        ? "bg-[#F0B232]"
                        : "bg-[#DA373C]",
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              {user.id !== currentUser?.id && (
                <>
                  <button className="bg-[#4E5058] hover:bg-[#6D6F78] text-white p-2 rounded transition-colors group relative">
                    <svg
                      className="w-5 h-5 text-[#DBDEE1]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-[#111214] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointe-events-none">
                      Gift Nitro
                    </div>
                  </button>
                  <button className="bg-[#4E5058] hover:bg-[#6D6F78] text-white p-2 rounded transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      onSendMessage?.();
                      onClose();
                    }}
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-[#111214] rounded-lg p-3 w-full">
            <h1 className="text-xl font-bold text-white leading-tight">
              {user.username}
            </h1>
            <h2 className="text-sm text-[#DBDEE1] mb-3">{user.username}</h2>

            <div className="w-full h-[1px] bg-[#2B2D31] mb-3" />

            <div className="mt-2">
              <h3 className="text-xs font-bold text-[#DBDEE1] uppercase mb-1">
                About Me
              </h3>
              <p className="text-sm text-[#DBDEE1] mb-1">
                Hello! I am {user.username}. Nice to meet you.
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#DBDEE1] uppercase mb-2">
                Discord Member Since
              </h3>
              <p className="text-sm text-[#DBDEE1]">May 19, 2026</p>
            </div>

            {server && (
              <div className="mt-4 flex flex-col gap-2 relative">
                <h3 className="text-xs font-bold text-[#DBDEE1] uppercase mb-1">
                  Roles
                </h3>
                <div className="flex flex-wrap items-center gap-1">
                  {userRoles.map((role: any) => (
                    <div
                      key={role.id}
                      className="bg-[#2B2D31] border border-[#1E1F22] rounded flex items-center gap-1.5 px-2 py-1 text-xs group relative"
                    >
                      {role.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        ></div>
                      )}
                      {role.emoji && (
                        <span className="text-[10px]">{role.emoji}</span>
                      )}
                      <span style={{ color: role.color }}>{role.name}</span>
                      {canManageRoles && (
                        <button
                          onClick={(e) => removeRole(role.id, e)}
                          className="ml-1 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {canManageRoles && (
                    <div className="relative" ref={selectorRef}>
                      <button
                        onClick={() => setShowRoleSelector(!showRoleSelector)}
                        className="w-6 h-6 rounded-full bg-[#2B2D31] cursor-pointer hover:bg-[#35373C] flex items-center justify-center transition-colors border border-[#1E1F22]"
                      >
                        <Plus className="w-3 h-3 text-[#B5BAC1]" />
                      </button>

                      {showRoleSelector && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#2B2D31] border border-[#1E1F22] rounded-lg shadow-2xl z-50 py-2 custom-scrollbar max-h-64 overflow-y-auto">
                          <div className="px-2 pb-2 text-xs font-bold text-[#B5BAC1] uppercase">
                            Add Role
                          </div>
                          {availableRolesToAdd.length > 0 ? (
                            availableRolesToAdd.map((role: any) => (
                              <div
                                key={role.id}
                                onClick={() => addRole(role.id)}
                                className="px-3 py-1.5 hover:bg-[#35373C] cursor-pointer flex items-center gap-2 group"
                              >
                                {role.color && (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: role.color }}
                                  ></div>
                                )}
                                {role.emoji && (
                                  <span className="text-[10px]">
                                    {role.emoji}
                                  </span>
                                )}
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: role.color || "#DBDEE1" }}
                                >
                                  {role.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-[#949BA4]">
                              No roles available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
