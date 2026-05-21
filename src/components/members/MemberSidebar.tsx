import React from "react";

interface MemberSidebarProps {
  server: any;
  currentUser?: any;
  onMemberClick?: (member: any) => void;
}

export function MemberSidebar({
  server,
  currentUser,
  onMemberClick,
}: MemberSidebarProps) {
  if (!server) return null;

  const members = server.members || (currentUser ? [currentUser] : []);

  return (
    <div className="w-[240px] bg-[#2B2D31] h-screen flex flex-col flex-shrink-0">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="mb-6">
          <div className="text-xs font-semibold text-[#949BA4] mb-1 flex items-center uppercase">
            Online — {members.length}
          </div>
          {members.map((member: any) => {
            const highestRole = server.roles?.find((r: any) =>
              member.roles?.includes(r.id),
            );

            return (
              <div
                key={member.id}
                onClick={() => onMemberClick?.(member)}
                className="flex items-center hover:bg-[#35373C] p-1 mx-[-8px] px-2 rounded cursor-pointer group mb-[2px]"
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 mr-3 relative flex-shrink-0">
                  <img
                    src={
                      member.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`
                    }
                    alt="avatar"
                    className="w-full h-full rounded-full bg-[#1E1F22]"
                  />
                  <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 bg-[#2B2D31] rounded-full flex items-center justify-center group-hover:bg-[#35373C]">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${member.status === "online" ? "bg-[#23A559]" : member.status === "idle" ? "bg-[#F0B232]" : "bg-[#DA373C]"}`}
                    />
                  </div>
                </div>
                <div className="flex flex-col truncate min-w-0 flex-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className="font-medium text-[#DBDEE1] truncate group-hover:text-white"
                      style={{ color: member.color || "inherit" }}
                    >
                      {member.username}
                    </span>
                    {highestRole?.icon ? (
                      <img
                        src={highestRole.icon}
                        alt="role"
                        className="w-4 h-4 object-contain flex-shrink-0"
                      />
                    ) : highestRole?.emoji ? (
                      <span className="text-xs flex-shrink-0">
                        {highestRole.emoji}
                      </span>
                    ) : null}
                  </div>
                  {member.customStatus && (
                    <span className="text-xs text-[#949BA4] truncate">
                      {member.customStatus}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
