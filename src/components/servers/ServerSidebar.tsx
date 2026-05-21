import React from "react";
import { cn } from "@/lib/utils";

interface ServerSidebarProps {
  servers: any[];
  activeServerId?: string;
  onSelectServer: (id: string) => void;
  onAddServer: () => void;
}

export function ServerSidebar({ servers, activeServerId, onSelectServer, onAddServer }: ServerSidebarProps) {
  return (
    <div className="w-[72px] h-screen bg-discord-sidebar flex flex-col items-center py-3 gap-2 flex-shrink-0 relative z-20">
      {/* Discord Home Button */}
      <div className="group relative flex items-center justify-center cursor-pointer mb-2 w-full" onClick={() => onSelectServer("")}>
        <div className={cn(
          "absolute left-0 bg-white rounded-r-full transition-all duration-300 w-1",
          activeServerId === "" ? "h-10" : "h-2 group-hover:h-5 scale-0 group-hover:scale-100"
        )} />
        <div className={cn(
          "w-12 h-12 flex items-center justify-center transition-all overflow-hidden bg-discord-chat text-discord-white group-hover:bg-discord-brand group-hover:text-white",
          activeServerId === "" ? "rounded-2xl bg-discord-brand text-white" : "rounded-[24px] group-hover:rounded-2xl"
        )}>
          {/* Discord Icon placeholder */}
          <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor">
            <path d="M23.0212 1.67671C21.3107 0.889667 19.5079 0.347766 17.6584 0C17.4062 0.461742 17.1118 1.11119 16.9015 1.61386C14.8693 1.3094 12.8687 1.3094 10.8785 1.61386C10.6682 1.11119 10.3739 0.461742 10.1216 0C8.25114 0.347766 6.44841 0.889667 4.73789 1.67671C1.36838 6.76451 -0.356391 11.7374 0.0482559 16.634C2.32757 18.3308 4.54381 19.3496 6.71791 20C7.26471 19.2568 7.74843 18.4719 8.1691 17.6358C7.3913 17.3486 6.65555 16.9691 5.94084 16.5163C6.13009 16.3768 6.30882 16.2267 6.48756 16.0766C10.8575 18.1187 16.9421 18.1187 21.2699 16.0766C21.4487 16.2267 21.6274 16.3768 21.8166 16.5163C21.1019 16.9691 20.3662 17.3486 19.5884 17.6358C20.0091 18.4719 20.4928 19.2568 21.0396 20C23.2137 19.3496 25.4299 18.3308 27.7093 16.634C28.1929 10.966 25.9625 6.00282 23.0212 1.67671ZM9.68007 13.6383C8.39702 13.6383 7.34538 12.4431 7.34538 10.9939C7.34538 9.54477 8.37599 8.34951 9.68007 8.34951C10.9842 8.34951 12.0358 9.54477 12.0148 10.9939C12.0148 12.4431 10.9842 13.6383 9.68007 13.6383ZM18.1068 13.6383C16.8237 13.6383 15.7721 12.4431 15.7721 10.9939C15.7721 9.54477 16.8027 8.34951 18.1068 8.34951C19.4109 8.34951 20.4625 9.54477 20.4415 10.9939C20.4415 12.4431 19.4109 13.6383 18.1068 13.6383Z" />
          </svg>
        </div>
      </div>
      
      <div className="w-8 h-[2px] bg-discord-divider rounded-full mb-2" />
      
      {servers.map((server) => {
        const isActive = activeServerId === server.id;
        return (
          <div key={server.id} className="group relative flex items-center justify-center cursor-pointer w-full" onClick={() => onSelectServer(server.id)}>
            <div className={cn(
              "absolute left-0 bg-white rounded-r-full transition-all duration-300 w-1",
              isActive ? "h-10 scale-100" : "h-5 opacity-0 scale-0 group-hover:scale-100 group-hover:opacity-100"
            )} />
            <div className={cn(
              "w-12 h-12 flex items-center justify-center transition-all overflow-hidden bg-discord-chat",
              isActive ? "rounded-2xl" : "rounded-[24px] group-hover:rounded-2xl"
            )}>
              {server.icon ? (
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium">{server.name.charAt(0)}</span>
              )}
            </div>
          </div>
        );
      })}

      <div className="group relative flex items-center justify-center cursor-pointer w-full mt-2" onClick={onAddServer}>
        <div className="w-12 h-12 flex items-center justify-center transition-all overflow-hidden bg-discord-chat text-green-500 rounded-[24px] group-hover:rounded-2xl group-hover:bg-green-500 group-hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
