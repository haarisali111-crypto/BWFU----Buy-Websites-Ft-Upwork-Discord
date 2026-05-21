import React, { useState } from "react";
import { ServerSidebar } from "./components/servers/ServerSidebar";
import { ChannelSidebar } from "./components/channels/ChannelSidebar";
import { ChatArea } from "./components/chat/ChatArea";
import { MemberSidebar } from "./components/members/MemberSidebar";
import { ServerSettingsModal } from "./components/modals/ServerSettingsModal";
import { currentUser as defaultUser } from "./data/mock";
import { CreateChannelModal } from "./components/modals/CreateChannelModal";
import { AddServerModal } from "./components/modals/AddServerModal";
import { CreateCategoryModal } from "./components/modals/CreateCategoryModal";
import { AuthPage } from "./components/auth/AuthPage";
import { UserProfileModal } from "./components/modals/UserProfileModal";
import { UserSettingsModal } from "./components/modals/UserSettingsModal";
import { ChannelSettingsModal } from "./components/modals/ChannelSettingsModal";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = window.localStorage.getItem("discord_currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeServerId, setActiveServerId] = useState(
    () => window.localStorage.getItem("discord_activeServerId") || "",
  );
  const [activeChannelId, setActiveChannelId] = useState(
    () => window.localStorage.getItem("discord_activeChannelId") || "",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState<any>(null);
  const [showCreateChannel, setShowCreateChannel] = useState<{
    show: boolean;
    category?: string;
  }>({ show: false });
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showAddServer, setShowAddServer] = useState(false);
  const [servers, setServers] = useState<any[]>(() => {
    try {
      const saved = window.localStorage.getItem("discord_servers");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [messagesByChannel, setMessagesByChannel] = useState<
    Record<string, any[]>
  >(() => {
    try {
      const saved = window.localStorage.getItem("discord_messages");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedProfileUser, setSelectedProfileUser] = useState<any>(null);

  // Onboarding state
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  const activeServer =
    servers.find((s) => s.id === activeServerId) || servers[0];
  const activeChannel =
    activeServer?.channels.find((c: any) => c.id === activeChannelId) ||
    activeServer?.channels[0];
  const currentMessages = messagesByChannel[activeChannel?.id] || [];

  React.useEffect(() => {
    window.localStorage.setItem(
      "discord_currentUser",
      JSON.stringify(currentUser),
    );
  }, [currentUser]);

  React.useEffect(() => {
    // Migration: ensure Moderator role exists in state
    let needsMigration = false;
    const migratedServers = servers.map((s) => {
      if (!s.roles?.find((r: any) => r.name === "Moderator")) {
        needsMigration = true;
        return {
          ...s,
          roles: [
            ...(s.roles || []),
            {
              id: `r_mod_${Date.now()}_${Math.random()}`,
              name: "Moderator",
              color: "#2ECC71",
              permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS", "BAN_MEMBERS"],
              hoist: true,
              mentionable: true,
            },
          ],
        };
      }
      return s;
    });

    if (needsMigration) {
      setServers(migratedServers);
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem("discord_servers", JSON.stringify(servers));
  }, [servers]);

  React.useEffect(() => {
    window.localStorage.setItem(
      "discord_messages",
      JSON.stringify(messagesByChannel),
    );
  }, [messagesByChannel]);

  React.useEffect(() => {
    window.localStorage.setItem("discord_activeServerId", activeServerId);
  }, [activeServerId]);

  React.useEffect(() => {
    window.localStorage.setItem("discord_activeChannelId", activeChannelId);
  }, [activeChannelId]);

  const handleSelectServer = (id: string) => {
    setActiveServerId(id);
    if (id !== "") {
      const server = servers.find((s) => s.id === id);
      if (server && server.channels.length > 0) {
        setActiveChannelId(server.channels[0].id);
      }
    }
  };

  const handleCreateCategory = (name: string) => {
    if (!activeServer) return;
    setServers(
      servers.map((s) => {
        if (s.id === activeServer.id) {
          const newCategories = [...(s.categories || []), name];
          return { ...s, categories: Array.from(new Set(newCategories)) };
        }
        return s;
      }),
    );
    setShowCreateCategory(false);
  };

  const handleLeaveServer = () => {
    setServers(servers.filter((s) => s.id !== activeServerId));
    setActiveServerId("");
    setActiveChannelId("");
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!activeChannel) return;
    setMessagesByChannel((prev) => {
      const msgs = prev[activeChannel.id] || [];
      return {
        ...prev,
        [activeChannel.id]: msgs.map((msg) => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const existing = reactions.find((r: any) => r.emoji === emoji);
            if (existing) {
              // Add user if not already there, else remove user
              if (existing.users.includes(currentUser.id)) {
                existing.users = existing.users.filter(
                  (id: string) => id !== currentUser.id,
                );
                existing.count--;
              } else {
                existing.users.push(currentUser.id);
                existing.count++;
              }
            } else {
              reactions.push({ emoji, count: 1, users: [currentUser.id] });
            }
            return {
              ...msg,
              reactions: reactions.filter((r: any) => r.count > 0),
            };
          }
          return msg;
        }),
      };
    });
  };

  const handleSendMessage = (content: string, attachmentUrl?: string) => {
    if (!activeChannel && !content && !attachmentUrl) return;

    // Process commands
    if (content.startsWith("/")) {
      const parts = content.split(" ");
      const cmd = parts[0].toLowerCase();

      const sendSystemMessage = (text: string) => {
        const sysMsg = {
          id: `m_${Date.now()}`,
          type: "system",
          content: text,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessagesByChannel((prev) => ({
          ...prev,
          [activeChannel.id]: [...(prev[activeChannel.id] || []), sysMsg],
        }));
      };

      // Helper to find member by @username
      const getTargetMember = (mention: string) => {
        const name = mention.replace("@", "");
        return activeServer?.members?.find((m: any) => m.username === name);
      };

      // Helper to find role by name
      const getTargetRole = (mention: string) => {
        const name = mention.replace("@", "");
        return activeServer?.roles?.find((r: any) => r.name === name);
      };

      // Checking admin privileges
      const isCmdAdmin = () => {
        const member = activeServer?.members?.find(
          (m: any) => m.id === currentUser.id,
        );
        if (activeServer?.members?.[0]?.id === currentUser.id) return true; // first member is likely owner
        const memberRoles =
          activeServer?.roles?.filter((r: any) =>
            member?.roles?.includes(r.id),
          ) || [];
        return memberRoles.some((r: any) =>
          r.permissions?.includes("ADMINISTRATOR"),
        );
      };

      if (["/ban", "/timeout", "/kick", "/role"].includes(cmd)) {
        if (!isCmdAdmin()) {
          sendSystemMessage("You do not have permission to use this command.");
          return;
        }

        if (cmd === "/role") {
          // /role @user @role
          const targetMention = parts[1];
          const roleMention = parts.slice(2).join(" ");

          if (!targetMention || !roleMention) {
            sendSystemMessage("Usage: /role @username @rolename");
            return;
          }

          const targetUser = getTargetMember(targetMention);
          const targetRole = getTargetRole(roleMention);

          if (!targetUser) {
            sendSystemMessage(`User ${targetMention} not found.`);
            return;
          }
          if (!targetRole) {
            sendSystemMessage(`Role ${roleMention} not found.`);
            return;
          }

          // Basic hierarchy check based on position in array
          const userHighestRoleIndex =
            activeServer?.roles?.findIndex((r: any) =>
              activeServer?.members
                ?.find((m: any) => m.id === currentUser.id)
                ?.roles?.includes(r.id),
            ) ?? -1;
          const targetRoleIndex =
            activeServer?.roles?.findIndex(
              (r: any) => r.id === targetRole.id,
            ) ?? -1;

          if (
            activeServer?.members?.[0]?.id !== currentUser.id &&
            userHighestRoleIndex >= targetRoleIndex
          ) {
            sendSystemMessage(
              `You cannot manage a role higher or equal to your highest role.`,
            );
            return;
          }

          setServers((prev) =>
            prev.map((s) => {
              if (s.id !== activeServer?.id) return s;
              return {
                ...s,
                members: s.members.map((m: any) => {
                  if (m.id === targetUser.id) {
                    const rz = m.roles || [];
                    if (!rz.includes(targetRole.id)) {
                      sendSystemMessage(
                        `Added role ${targetRole.name} to ${targetUser.username}.`,
                      );
                      return { ...m, roles: [...rz, targetRole.id] };
                    } else {
                      sendSystemMessage(
                        `Removed role ${targetRole.name} from ${targetUser.username}.`,
                      );
                      return {
                        ...m,
                        roles: rz.filter((id: string) => id !== targetRole.id),
                      };
                    }
                  }
                  return m;
                }),
              };
            }),
          );
          return;
        }

        if (cmd === "/kick") {
          const targetMention = parts[1];
          const reason = parts.slice(2).join(" ");
          if (!targetMention) {
            sendSystemMessage(`Usage: /kick @username [reason]`);
            return;
          }
          const targetUser = getTargetMember(targetMention);
          if (!targetUser) {
            sendSystemMessage(`User ${targetMention} not found.`);
            return;
          }

          const userHighestRoleIndex =
            activeServer?.roles?.findIndex((r: any) =>
              activeServer?.members
                ?.find((m: any) => m.id === currentUser.id)
                ?.roles?.includes(r.id),
            ) ?? -1;
          const targetUserHighestRoleIndex =
            activeServer?.roles?.findIndex((r: any) =>
              targetUser?.roles?.includes(r.id),
            ) ?? activeServer?.roles?.length;

          if (
            activeServer?.members?.[0]?.id !== currentUser.id &&
            userHighestRoleIndex >= targetUserHighestRoleIndex
          ) {
            sendSystemMessage(
              `You cannot kick a user with a role higher or equal to yours.`,
            );
            return;
          }

          sendSystemMessage(
            `User ${targetUser.username} has been kicked. Reason: ${reason || "No reason provided"}`,
          );

          setServers((prev) =>
            prev.map((s) => {
              if (s.id !== activeServer?.id) return s;
              return {
                ...s,
                members: s.members.filter((m: any) => m.id !== targetUser.id),
              };
            }),
          );
          return;
        }

        if (cmd === "/ban") {
          // /ban user [time] [reason]
          // Ignoring delete_days for simplicity of implementation
          const targetMention = parts[1];
          const time = parts[2] && !parts[2].includes(" ") ? parts[2] : null;
          const reasonParts = time ? parts.slice(3) : parts.slice(2);
          const reason = reasonParts.join(" ");

          if (!targetMention) {
            sendSystemMessage(`Usage: /ban @username [time] [reason]`);
            return;
          }
          const targetUser = getTargetMember(targetMention);
          if (!targetUser) {
            sendSystemMessage(`User ${targetMention} not found.`);
            return;
          }

          const userHighestRoleIndex =
            activeServer?.roles?.findIndex((r: any) =>
              activeServer?.members
                ?.find((m: any) => m.id === currentUser.id)
                ?.roles?.includes(r.id),
            ) ?? -1;
          const targetUserHighestRoleIndex =
            activeServer?.roles?.findIndex((r: any) =>
              targetUser?.roles?.includes(r.id),
            ) ?? activeServer?.roles?.length;

          if (
            activeServer?.members?.[0]?.id !== currentUser.id &&
            userHighestRoleIndex >= targetUserHighestRoleIndex
          ) {
            sendSystemMessage(
              `You cannot ban a user with a role higher or equal to yours.`,
            );
            return;
          }

          sendSystemMessage(
            `User ${targetUser.username} has been banned. Time: ${time || "Permanent"} | Reason: ${reason || "No reason provided"}`,
          );

          setServers((prev) =>
            prev.map((s) => {
              if (s.id !== activeServer?.id) return s;
              return {
                ...s,
                members: s.members.filter((m: any) => m.id !== targetUser.id),
                bannedUsers: [...(s.bannedUsers || []), targetUser.id],
              };
            }),
          );
          return;
        }

        if (cmd === "/unban") {
          const targetId = parts[1];
          if (!targetId) {
            sendSystemMessage(`Usage: /unban user_id`);
            return;
          }

          let wasUnbanned = false;
          setServers((prev) =>
            prev.map((s) => {
              if (s.id !== activeServer?.id) return s;
              if (s.bannedUsers?.includes(targetId)) {
                wasUnbanned = true;
              }
              return {
                ...s,
                bannedUsers:
                  s.bannedUsers?.filter((id: string) => id !== targetId) || [],
              };
            }),
          );

          sendSystemMessage(`User ${targetId} has been unbanned.`);
          return;
        }

        if (cmd === "/timeout") {
          const targetMention = parts[1];
          const timeStr = parts[2];
          const reason = parts.slice(3).join(" ");

          if (!targetMention || !timeStr) {
            sendSystemMessage(
              `Usage: /timeout @username time [reason] (e.g. time: 1m, 1h, 7days, 1w)`,
            );
            return;
          }

          let ms = 0;
          const val = parseInt(timeStr);
          if (!isNaN(val)) {
            if (timeStr.endsWith("m")) ms = val * 60 * 1000;
            else if (timeStr.endsWith("h")) ms = val * 60 * 60 * 1000;
            else if (timeStr.endsWith("d") || timeStr.endsWith("days"))
              ms = val * 24 * 60 * 60 * 1000;
            else if (timeStr.endsWith("w") || timeStr.endsWith("weeks"))
              ms = val * 7 * 24 * 60 * 60 * 1000;
          }

          if (ms === 0) {
            sendSystemMessage(`Invalid time format. Use 1m, 1h, 1d, 1w.`);
            return;
          }

          const targetUser = getTargetMember(targetMention);
          if (!targetUser) {
            sendSystemMessage(`User ${targetMention} not found.`);
            return;
          }

          const userHighestRoleIndex =
            activeServer?.roles?.findIndex((r: any) =>
              activeServer?.members
                ?.find((m: any) => m.id === currentUser.id)
                ?.roles?.includes(r.id),
            ) ?? -1;
          const targetUserHighestRoleIndex =
            activeServer?.roles?.findIndex((r: any) =>
              targetUser?.roles?.includes(r.id),
            ) ?? activeServer?.roles?.length;

          if (
            activeServer?.members?.[0]?.id !== currentUser.id &&
            userHighestRoleIndex >= targetUserHighestRoleIndex
          ) {
            sendSystemMessage(
              `You cannot timeout a user with a role higher or equal to yours.`,
            );
            return;
          }

          sendSystemMessage(
            `User ${targetUser.username} has been timed out for ${timeStr}. Reason: ${reason || "No reason provided"}`,
          );

          setServers((prev) =>
            prev.map((s) => {
              if (s.id !== activeServer?.id) return s;
              return {
                ...s,
                members: s.members.map((m: any) =>
                  m.id === targetUser.id
                    ? { ...m, timeoutUntil: Date.now() + ms }
                    : m,
                ),
              };
            }),
          );
          return;
        }

        if (cmd === "/ask-ai") {
          const query = parts.slice(1).join(" ");
          if (!query) {
            sendSystemMessage("Usage: /ask-ai [your question]");
            return;
          }

          sendSystemMessage(`You asked AI: ${query}`);

          setTimeout(() => {
            // Fake AI Responses based on keywords
            let aiResponse =
              "I'm not sure how to answer that yet, I'm still learning!";
            const q = query.toLowerCase();

            if (q.includes("summarize") || q.includes("summary")) {
              aiResponse =
                "**Channel Summary (Last 24h):**\nUsers discussed the new monetization features. @haaris mentioned adding Stripe Connect. Sentiment is overwhelmingly positive (92%).";
            } else if (q.includes("health") || q.includes("score")) {
              aiResponse =
                "**Community Health:**\n92/100. Toxic messages are down 15% this week. Engagement is peaking in #announcements.";
            } else if (q.includes("who is") || q.includes("info")) {
              aiResponse =
                "I have fetched user context. This user joined 2 days ago and has 50+ messages.";
            } else {
              aiResponse =
                "This is a simulated AI response. In a real app, this would connect to an LLM endpoint.";
            }

            // Wrap in a custom 'ai' type message layout or just system message?
            // Let's create an AI message
            const aiMsg = {
              id: `ai_${Date.now()}`,
              type: "system",
              content: `✨ **Luminia AI:** ${aiResponse}`,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            setMessagesByChannel((prev) => ({
              ...prev,
              [activeChannel.id]: [...(prev[activeChannel.id] || []), aiMsg],
            }));
          }, 1000);

          return;
        }
      }
    }

    const newMsg = {
      id: `m_${Date.now()}`,
      type: "user",
      user: currentUser,
      content,
      attachmentUrl,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reactions: [],
    };
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), newMsg],
    }));
  };

  const handleJoinServer = (inviteCode: string) => {
    // Check if inviteCode matches an existing server ID
    const existingServer = servers.find((s) => s.id === inviteCode);
    if (existingServer) {
      if (existingServer.bannedUsers?.includes(currentUser.id)) {
        // Can't join
        alert("You are banned from this server.");
        return;
      }
      // Check if already a member
      if (existingServer.members.find((m: any) => m.id === currentUser.id)) {
        setActiveServerId(existingServer.id);
        setActiveChannelId(existingServer.channels[0]?.id);
        return;
      }

      const updatedServer = {
        ...existingServer,
        members: [...existingServer.members, currentUser],
      };

      setServers(
        servers.map((s) => (s.id === existingServer.id ? updatedServer : s)),
      );
      setActiveServerId(updatedServer.id);
      setActiveChannelId(updatedServer.channels[0]?.id);
      return;
    }

    // Exact server from the screenshot requested by user
    const newServer = {
      id: `s_luminia_${Date.now()}`,
      name: "Luminia Ai",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=LuminiaAi",
      channels: [
        {
          id: `c_rules_${Date.now()}`,
          name: "!! | rules",
          type: "text",
          category: "⭐ IMPORTANT ⭐",
        },
        {
          id: `c_announcements_${Date.now()}`,
          name: "announcements",
          type: "text",
          category: "⭐ IMPORTANT ⭐",
        },
        {
          id: `c_partnership_${Date.now()}`,
          name: "partnership",
          type: "text",
          category: "⭐ IMPORTANT ⭐",
        },
        {
          id: `c_events_${Date.now()}`,
          name: "Events",
          type: "text",
          category: "",
        },
        {
          id: `c_boosts_${Date.now()}`,
          name: "Server Boosts",
          type: "text",
          category: "",
        },
        {
          id: `c_mod_${Date.now()}`,
          name: "moderator-only",
          type: "text",
          category: "MODERATION",
        },
        {
          id: `c_shieldify_${Date.now()}`,
          name: "shieldify-logs-news",
          type: "text",
          category: "MODERATION",
        },
        {
          id: `c_wick_${Date.now()}`,
          name: "wick-logs",
          type: "text",
          category: "MODERATION",
        },
        {
          id: `c_modlogs_${Date.now()}`,
          name: "modlogs",
          type: "text",
          category: "MODERATION",
        },
        {
          id: `c_ticket10_${Date.now()}`,
          name: "ticket-10",
          type: "text",
          category: "TICKETS",
        },
        {
          id: `c_ticket15_${Date.now()}`,
          name: "ticket-15",
          type: "text",
          category: "TICKETS",
        },
        {
          id: `c_dontchat_${Date.now()}`,
          name: "dont-chat-here",
          type: "text",
          category: "TICKETS",
        },
        {
          id: `c_roles_${Date.now()}`,
          name: "👀 | get-your-roles",
          type: "text",
          category: "📌 PINNED 📌",
        },
        {
          id: `c_inv_${Date.now()}`,
          name: "🎁 | inv-rewards",
          type: "text",
          category: "📌 PINNED 📌",
        },
        {
          id: `c_boost_${Date.now()}`,
          name: "🚀 | boost-rewards",
          type: "text",
          category: "📌 PINNED 📌",
        },
        {
          id: `c_joins_${Date.now()}`,
          name: "👋 | joins",
          type: "text",
          category: "👋 WELCOME 👋",
        },
        {
          id: `c_leaves_${Date.now()}`,
          name: "👋 | leaves",
          type: "text",
          category: "👋 WELCOME 👋",
        },
      ],
      roles: [
        { id: `r_everyone_${Date.now()}`, name: "@everyone", color: "#949BA4" },
        {
          id: `r_mod_${Date.now()}`,
          name: "Moderator",
          color: "#2ECC71",
          permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS", "BAN_MEMBERS"],
          hoist: true,
          mentionable: true,
        },
      ],
      members: [currentUser],
    };

    setServers([...servers, newServer]);
    setActiveServerId(newServer.id);
    setActiveChannelId(newServer.channels[0].id); // The rules channel
  };

  const handleCreateChannel = (
    name: string,
    type: string,
    categoryId?: string,
  ) => {
    if (!activeServer) return;

    const newChannel = {
      id: `c${Date.now()}`,
      name: name,
      type: type,
      category: categoryId || "GENERAL",
    };

    setServers(
      servers.map((s) => {
        if (s.id === activeServer.id) {
          return { ...s, channels: [...s.channels, newChannel] };
        }
        return s;
      }),
    );
    setActiveChannelId(newChannel.id);
    setShowCreateChannel({ show: false });
  };

  const handleCreateServer = (name: string, iconUrl?: string) => {
    const newServer = {
      id: `s${Date.now()}`,
      name: name,
      icon: iconUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
      channels: [
        {
          id: `c_gen_${Date.now()}`,
          name: "general",
          type: "text",
          category: "GENERAL",
        },
      ],
      roles: [
        { id: `r_everyone_${Date.now()}`, name: "@everyone", color: "#949BA4" },
        {
          id: `r_mod_${Date.now()}`,
          name: "Moderator",
          color: "#2ECC71",
          permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS", "BAN_MEMBERS"],
          hoist: true,
          mentionable: true,
        },
      ],
      members: currentUser ? [currentUser] : [],
    };

    setServers([...servers, newServer]);
    setActiveServerId(newServer.id);
    setActiveChannelId(newServer.channels[0].id);
    setShowAddServer(false);
  };

  const handleLogin = (username: string, avatar: string) => {
    setCurrentUser({
      id: "u_new",
      username,
      avatar:
        avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      status: "online",
    });
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#313338] overflow-hidden font-sans text-discord-white select-none">
      <ServerSidebar
        servers={servers}
        activeServerId={activeServerId}
        onSelectServer={handleSelectServer}
        onAddServer={() => setShowAddServer(true)}
      />

      {activeServerId === "" ? (
        // Friends / Home View Placeholder
        <div className="flex-1 flex bg-discord-sidebar h-screen items-start relative overflow-hidden">
          {/* Main Friends List View - Stylish and Gradients */}
          <div className="flex-1 flex flex-col h-full bg-discord-chat relative z-10">
            <div className="h-12 border-b border-discord-divider flex items-center px-4 shadow-sm flex-shrink-0 space-x-6 shrink-0 z-20">
              <div className="flex items-center text-gray-300 mr-2 font-medium">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 14v2a6 6 0 00-6 6H4a8 8 0 018-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm9 6h1v5h-8v-5h1v-1a3 3 0 016 0v1zm-2 0v-1a1 1 0 00-2 0v1h2z" />
                </svg>
                Friends
              </div>
              <div className="h-6 w-[1px] bg-discord-divider" />
              <div className="px-2 py-0.5 rounded cursor-pointer text-gray-300 hover:bg-discord-hover">
                Online
              </div>
              <div className="px-2 py-0.5 rounded cursor-pointer text-gray-300 hover:bg-discord-hover">
                All
              </div>
              <div className="px-2 py-0.5 rounded cursor-pointer text-gray-300 hover:bg-discord-hover">
                Pending
              </div>
              <div className="px-2 py-0.5 rounded cursor-pointer text-gray-300 hover:bg-discord-hover">
                Blocked
              </div>
              <div className="px-2 py-0.5 rounded bg-green-600 text-white font-medium cursor-pointer ml-auto hover:bg-green-500 transition-colors">
                Add Friend
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 relative">
              {/* Super premium gradient overlay */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-discord-brand/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />

              <div className="max-w-[700px] mx-auto z-10 relative">
                <div className="flex items-center justify-center flex-col text-center mt-20">
                  <div className="w-64 h-64 bg-[url('https://discord.com/assets/a12ff54c4c5c03b41006.svg')] bg-contain bg-no-repeat bg-center mb-6 opacity-80" />
                  <h3 className="text-gray-400 font-medium">
                    No one's around to play with Wumpus.
                  </h3>
                </div>
              </div>
            </div>
          </div>
          {/* Active Now Sidebar */}
          <div className="w-[360px] h-screen bg-discord-channel border-l border-discord-divider p-4 z-20 overflow-y-auto">
            <h2 className="font-bold text-xl text-white mb-6">Active Now</h2>
            <div className="text-center text-gray-400 py-8 px-4 bg-discord-chat rounded-lg border border-discord-divider">
              <h3 className="font-semibold text-gray-300 mb-2">
                It's quiet for now...
              </h3>
              <p className="text-sm text-gray-400">
                When a friend starts an activity—like playing a game or hanging
                out on voice—we'll show it here!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChannelSidebar
            server={activeServer}
            activeChannelId={activeChannelId}
            onSelectChannel={setActiveChannelId}
            onOpenSettings={() => setShowSettings(true)}
            onOpenUserSettings={() => setShowUserSettings(true)}
            onOpenCreateChannel={(cat) =>
              setShowCreateChannel({ show: true, category: cat })
            }
            onOpenCreateCategory={() => setShowCreateCategory(true)}
            onOpenChannelSettings={(ch) =>
              setShowChannelSettings({ channel: ch })
            }
            onLeaveServer={handleLeaveServer}
            currentUser={currentUser}
          />
          <ChatArea
            channel={activeChannel}
            server={activeServer}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onAddReaction={handleAddReaction}
            onJoinServer={handleJoinServer}
            onMemberClick={(member) => setSelectedProfileUser(member)}
          />
          <MemberSidebar
            server={activeServer}
            currentUser={currentUser}
            onMemberClick={(member) => setSelectedProfileUser(member)}
          />
        </>
      )}

      {showSettings && activeServer && (
        <ServerSettingsModal
          server={activeServer}
          onClose={() => setShowSettings(false)}
          onUpdateServer={(serverId, updates) => {
            setServers(
              servers.map((s) =>
                s.id === serverId ? { ...s, ...updates } : s,
              ),
            );
          }}
        />
      )}

      {showUserSettings && currentUser && (
        <UserSettingsModal
          currentUser={currentUser}
          onClose={() => setShowUserSettings(false)}
          onUpdateUser={(updates) => {
            const updatedUser = { ...currentUser, ...updates };
            setCurrentUser(updatedUser);

            // Replicate to all servers' members arrays
            setServers(
              servers.map((s) => ({
                ...s,
                members: s.members.map((m: any) =>
                  m.id === updatedUser.id ? { ...m, ...updates } : m,
                ),
              })),
            );

            // Replicate to messages
            const newMessages = { ...messagesByChannel };
            for (const channelId in newMessages) {
              newMessages[channelId] = newMessages[channelId].map((msg: any) =>
                msg.user?.id === updatedUser.id
                  ? { ...msg, user: { ...msg.user, ...updates } }
                  : msg,
              );
            }
            setMessagesByChannel(newMessages);
          }}
        />
      )}

      {showCreateChannel.show && (
        <CreateChannelModal
          onClose={() => setShowCreateChannel({ show: false })}
          onCreate={(name, type) =>
            handleCreateChannel(name, type, showCreateChannel.category)
          }
        />
      )}

      {showCreateCategory && (
        <CreateCategoryModal
          onClose={() => setShowCreateCategory(false)}
          onCreate={handleCreateCategory}
        />
      )}

      {showAddServer && (
        <AddServerModal
          onClose={() => setShowAddServer(false)}
          onCreate={handleCreateServer}
        />
      )}

      {showChannelSettings && (
        <ChannelSettingsModal
          channel={showChannelSettings.channel}
          server={activeServer}
          onClose={() => setShowChannelSettings(null)}
        />
      )}

      {selectedProfileUser && (
        <UserProfileModal
          user={selectedProfileUser}
          currentUser={currentUser}
          server={activeServer}
          onClose={() => setSelectedProfileUser(null)}
          onSendMessage={() => {
            setSelectedProfileUser(null);
            setActiveServerId(""); // Go to Home / DM view
          }}
          onUpdateMemberRoles={(userId, roleIds) => {
            setServers((prev) =>
              prev.map((s) => {
                if (s.id !== activeServer?.id) return s;
                return {
                  ...s,
                  members: s.members.map((m: any) =>
                    m.id === userId ? { ...m, roles: roleIds } : m,
                  ),
                };
              }),
            );
            // Update selected user as well to reflect changes immediately
            if (selectedProfileUser.id === userId) {
              setSelectedProfileUser({
                ...selectedProfileUser,
                roles: roleIds,
              });
            }
          }}
        />
      )}
    </div>
  );
}
