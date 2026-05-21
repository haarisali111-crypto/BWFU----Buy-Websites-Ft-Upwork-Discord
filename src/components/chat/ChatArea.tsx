import React from "react";
import {
  Hash,
  Search,
  HelpCircle,
  Bell,
  Pin,
  UserPlus,
  Inbox,
  Gift,
  Image,
  PlusCircle,
  Smile,
  X,
  Shield,
  DollarSign,
} from "lucide-react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import { mockMessages } from "@/data/mock";

interface ChatAreaProps {
  channel: any;
  server: any;
  messages: any[];
  onSendMessage: (content: string, attachmentUrl?: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onJoinServer: (inviteCode: string) => void;
  onMemberClick?: (member: any) => void;
}

export function ChatArea({
  channel,
  server,
  messages,
  onSendMessage,
  onAddReaction,
  onJoinServer,
  onMemberClick,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [attachment, setAttachment] = React.useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showReactionPicker, setShowReactionPicker] = React.useState<
    string | null
  >(null);
  const [mentionQuery, setMentionQuery] = React.useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = React.useState(0);
  const [commandQuery, setCommandQuery] = React.useState<string | null>(null);
  const [commandIndex, setCommandIndex] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const commandsList = [
    {
      name: "ban",
      desc: "Ban a user",
      options: [
        { name: "user", required: true, desc: "User to ban" },
        { name: "time", desc: "Time until the user gets unbanned" },
        { name: "reason", desc: "Reason of banning this user" },
        {
          name: "delete_days",
          desc: "Number of days the messages should be deleted, 7 is the limit",
        },
      ],
    },
    {
      name: "kick",
      desc: "Kick a user from the server",
      options: [
        { name: "user", required: true, desc: "User to kick" },
        { name: "reason", desc: "Reason of kicking this user" },
      ],
    },
    {
      name: "unban",
      desc: "Unban a user from the server",
      options: [{ name: "user_id", required: true, desc: "User ID to unban" }],
    },
    {
      name: "timeout",
      desc: "Timeout a user in the server",
      options: [
        { name: "user", required: true, desc: "User to timeout" },
        { name: "time", required: true, desc: "Duration (1m, 1h, 7days, 1w)" },
        { name: "reason", desc: "Reason for timeout" },
      ],
    },
    {
      name: "role",
      desc: "Manage a member's roles",
      options: [
        { name: "user", required: true, desc: "Target user" },
        { name: "role", required: true, desc: "Target role" },
      ],
    },
    {
      name: "ask-ai",
      desc: "Ask the Server Brain a question (e.g., summarize chat)",
      options: [
        {
          name: "query",
          required: true,
          desc: "What do you want to ask the AI?",
        },
      ],
    },
  ];

  const filteredCommands = React.useMemo(() => {
    if (commandQuery === null) return [];
    return commandsList.filter((c) =>
      c.name.startsWith(commandQuery.toLowerCase()),
    );
  }, [commandQuery]);

  const insertCommand = (cmd: any) => {
    if (!cmd) return;
    setInputValue(`/${cmd.name} `);
    setCommandQuery(null);
  };

  const mentionsList = React.useMemo(() => {
    const list: {
      id: string;
      name: string;
      type: "role" | "member";
      icon?: string;
      color?: string;
    }[] = [];
    if (!server) return list;

    list.push({ id: "everyone", name: "everyone", type: "role" });
    list.push({ id: "here", name: "here", type: "role" });

    server.roles?.forEach((r: any) => {
      if (r.name !== "@everyone") {
        list.push({
          id: r.id,
          name: r.name,
          type: "role",
          color: r.color,
          icon: r.emoji,
        });
      }
    });

    server.members?.forEach((m: any) => {
      list.push({ id: m.id, name: m.username, type: "member", icon: m.avatar });
    });

    return list;
  }, [server]);

  const filteredMentions = React.useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return mentionsList.filter((m) => m.name.toLowerCase().includes(q));
  }, [mentionQuery, mentionsList]);

  const insertMention = (mention: any) => {
    if (!mention) return;
    const match = inputValue.match(/(.*?)(?:^|\s)@(\w*)$/);
    if (match) {
      setInputValue(
        match[1] +
          (match[1] && !match[1].endsWith(" ") ? " " : "") +
          "@" +
          mention.name +
          " ",
      );
    } else {
      setInputValue(inputValue + "@" + mention.name + " ");
    }
    setMentionQuery(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.startsWith("/")) {
      const cmdMatch = val.match(/^\/([a-zA-Z0-9]*)$/);
      if (cmdMatch) {
        setCommandQuery(cmdMatch[1]);
        setCommandIndex(0);
        setMentionQuery(null);
        return;
      } else {
        setCommandQuery(null);
      }
    } else {
      setCommandQuery(null);
    }

    const match = val.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (commandQuery !== null && filteredCommands.length > 0) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCommandIndex(Math.max(0, commandIndex - 1));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCommandIndex(
          Math.min(filteredCommands.length - 1, commandIndex + 1),
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertCommand(filteredCommands[commandIndex]);
        return;
      }
      if (e.key === "Escape") {
        setCommandQuery(null);
        return;
      }
    }

    if (mentionQuery !== null && filteredMentions.length > 0) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(Math.max(0, mentionIndex - 1));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex(
          Math.min(filteredMentions.length - 1, mentionIndex + 1),
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMentions[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === "Enter" && (inputValue.trim() || attachment)) {
      onSendMessage(inputValue, attachment || undefined);
      setInputValue("");
      setAttachment(null);
      setMentionQuery(null);
      setCommandQuery(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAttachment(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderMessageContent = (content: string) => {
    const inviteRegex = /(discord\.gg\/[a-zA-Z0-9]+)/g;
    const mentionRegex = /(@[a-zA-Z0-9_\-]+)/g;

    const parts = content
      .split(new RegExp(`(${inviteRegex.source}|${mentionRegex.source})`, "g"))
      .filter(Boolean);

    const isInvite = (text: string) => text.match(inviteRegex);
    const isMention = (text: string) => text.match(mentionRegex);

    return (
      <div className="flex flex-col gap-2 mt-1 -ml-1">
        <div className="pl-1">
          {parts.map((part, i) => {
            if (isInvite(part)) {
              return (
                <span
                  key={i}
                  className="text-[#00A8FC] hover:underline cursor-pointer"
                >
                  {part}
                </span>
              );
            }
            if (isMention(part)) {
              const name = part.substring(1);
              const member = server?.members?.find(
                (m: any) => m.username === name,
              );
              const role = server?.roles?.find((r: any) => r.name === name);

              if (role) {
                return (
                  <span
                    key={i}
                    className="bg-[#5865F2]/20 font-medium px-1 rounded cursor-pointer hover:bg-[#5865F2]/40 transition-colors"
                    style={{ color: role.color }}
                  >
                    {part}
                  </span>
                );
              }

              if (member) {
                return (
                  <span
                    key={i}
                    className="bg-[#5865F2]/30 text-[#C9CDFB] px-1 rounded hover:bg-[#5865F2]/50 hover:text-white cursor-pointer transition-colors font-medium"
                    onClick={() => {
                      if (onMemberClick) onMemberClick(member);
                    }}
                  >
                    {part}
                  </span>
                );
              }

              if (name === "everyone" || name === "here") {
                return (
                  <span
                    key={i}
                    className="bg-[#5865F2]/30 text-[#C9CDFB] px-1 rounded font-medium"
                  >
                    {part}
                  </span>
                );
              }
            }
            return (
              <span
                key={i}
                className="text-gray-200 text-[15px] leading-[1.375rem]"
              >
                {part}
              </span>
            );
          })}
        </div>

        {parts
          .filter((p) => isInvite(p))
          .map((invite, idx) => (
            <div
              key={idx}
              className="bg-[#2B2D31] rounded flex flex-col p-4 max-w-[432px] border border-[#1E1F22] mt-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2] opacity-5 rounded-bl-full pointer-events-none"></div>
              <div className="text-xs font-bold text-[#B5BAC1] uppercase mb-3 z-10">
                YOU'VE BEEN INVITED TO JOIN A SERVER
              </div>
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1E1F22] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {server?.name?.charAt(0) || "S"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-base">
                      {server?.name || "Awesome Server"}
                    </span>
                    <div className="flex items-center gap-3 text-sm text-[#949BA4] mt-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#23A559]"></div>{" "}
                        1 Online
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#80848E]"></div>{" "}
                        1 Members
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onJoinServer(invite)}
                  className="bg-[#23A559] hover:bg-[#1a7a42] text-white px-5 py-2 rounded text-sm font-semibold transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
      </div>
    );
  };

  if (!channel)
    return (
      <div className="flex-1 bg-discord-chat h-screen flex items-center justify-center text-gray-500">
        No channel selected
      </div>
    );

  return (
    <div className="flex-1 flex flex-col h-screen min-w-0 bg-discord-chat relative z-10">
      {/* Header */}
      <div className="h-12 border-b border-discord-divider flex items-center justify-between px-4 font-semibold shadow-sm flex-shrink-0">
        <div className="flex items-center text-white min-w-0">
          <Hash className="w-6 h-6 text-gray-400 mr-2 flex-shrink-0" />
          <h3 className="truncate">{channel.name}</h3>

          <div className="flex items-center gap-1 ml-4 bg-[#23A559]/10 text-[#23A559] px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
            <Shield className="w-3 h-3" /> E2EE
          </div>
        </div>
        <div className="flex items-center text-gray-300 ml-4 space-x-4 flex-shrink-0">
          <Hash className="w-5 h-5 cursor-pointer hover:text-white" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-white" />
          <Pin className="w-5 h-5 cursor-pointer hover:text-white" />
          <UserPlus className="w-5 h-5 cursor-pointer hover:text-white" />
          <div className="relative w-36 h-6 bg-discord-sidebar rounded flex items-center px-1.5 focus-within:w-60 transition-all duration-300">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-400 w-full"
            />
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
          <Inbox className="w-5 h-5 cursor-pointer hover:text-white" />
          <HelpCircle className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col pt-auto justify-end">
        <div className="mt-8 mb-4">
          <div className="w-16 h-16 rounded-full bg-discord-active flex items-center justify-center mb-4 text-white">
            <Hash className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to #{channel.name}!
          </h1>
          <p className="text-gray-400">
            This is the start of the #{channel.name} channel.
          </p>
        </div>

        <div className="h-[1px] bg-discord-divider w-full my-6 flex items-center justify-center relative">
          <span className="bg-discord-chat px-2 text-xs font-semibold text-gray-400 absolute">
            19 May 2026
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="hover:bg-discord-hover py-1 px-4 -mx-4 flex transition-colors group relative"
          >
            {msg.type === "system" ? (
              <div className="flex items-start">
                <div className="w-[40px] flex justify-end mr-4 text-[#23A559] mt-1">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.118 3.121a1 1 0 001.414 0l5.952-5.95-1.062-1.062-5.6 5.6z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-300 text-sm">
                    {renderMessageContent(msg.content)}{" "}
                    <span className="text-xs text-gray-500 ml-1">
                      {msg.timestamp}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <div
                  className="w-10 h-10 rounded-full bg-gray-600 mr-4 flex-shrink-0 cursor-pointer overflow-hidden mt-0.5"
                  onClick={() => onMemberClick?.(msg.user)}
                >
                  {(msg as any).user?.avatar ? (
                    <img src={(msg as any).user.avatar} alt="avatar" />
                  ) : (
                    <div className="w-full h-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
                      {msg.user?.username?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      onClick={() => onMemberClick?.(msg.user)}
                      className="font-semibold text-white hover:underline cursor-pointer"
                      style={{ color: msg.user?.color || "white" }}
                    >
                      {(msg as any).user?.username}
                    </span>
                    {(() => {
                      const highestRole = server?.roles?.find((r: any) =>
                        msg.user?.roles?.includes(r.id),
                      );
                      if (highestRole?.icon) {
                        return (
                          <img
                            src={highestRole.icon}
                            alt="role"
                            className="w-4 h-4 object-contain"
                          />
                        );
                      }
                      if (highestRole?.emoji) {
                        return (
                          <span className="text-xs">{highestRole.emoji}</span>
                        );
                      }
                      return null;
                    })()}
                    <span className="text-xs text-[#949BA4] font-medium ml-1 mt-0.5">
                      {msg.timestamp}
                    </span>
                  </div>
                  {renderMessageContent(msg.content)}
                  {msg.attachmentUrl && (
                    <div className="mt-2 rounded overflow-hidden max-w-[400px]">
                      {msg.attachmentUrl.startsWith("data:image") ? (
                        <img
                          src={msg.attachmentUrl}
                          alt="attachment"
                          className="w-full h-auto object-cover rounded"
                        />
                      ) : (
                        <div className="bg-[#2B2D31] p-3 rounded flex items-center border border-[#1E1F22]">
                          <div className="w-10 h-10 bg-[#5865F2] rounded flex items-center justify-center mr-3">
                            <PlusCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">
                              File Attachment
                            </div>
                            <div className="text-[#949BA4] text-xs">
                              Shared file
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.reactions.map((reaction: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() =>
                            onAddReaction &&
                            onAddReaction(msg.id, reaction.emoji)
                          }
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border cursor-pointer hover:bg-[#35373C] hover:border-[#5865F2] ${reaction.users.includes("u_new") ? "bg-[#5865F2]/20 border-[#5865F2]" : "bg-[#2B2D31] border-transparent"}`}
                        >
                          <span className="text-sm leading-none">
                            {reaction.emoji}
                          </span>
                          <span
                            className={`text-xs font-bold leading-none ${reaction.users.includes("u_new") ? "text-[#5865F2]" : "text-[#B5BAC1]"}`}
                          >
                            {reaction.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hover Actions */}
            <div className="hidden group-hover:flex absolute right-4 -top-2 bg-discord-chat border border-[#1E1F22] rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div
                className="p-1.5 hover:bg-[#35373C] cursor-pointer text-[#B5BAC1] hover:text-[#DBDEE1] rounded-l"
                onClick={() => setShowReactionPicker(msg.id)}
                title="Add Reaction"
              >
                <Smile className="w-4 h-4" />
              </div>
              <div
                className="p-1.5 hover:bg-[#35373C] cursor-pointer text-[#2ECC71] hover:text-[#27AE60]"
                title="Tip Message"
              >
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="p-1.5 hover:bg-[#35373C] cursor-pointer text-[#B5BAC1] hover:text-[#DBDEE1] rounded-r">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {showReactionPicker === msg.id && (
              <div
                className="absolute right-4 top-8 z-[150] shadow-2xl bg-[#313338] p-2 rounded-lg border border-[#1E1F22]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-2 px-2">
                  <span className="font-bold text-white text-sm">
                    Add Reaction
                  </span>
                  <X
                    className="w-4 h-4 cursor-pointer text-[#B5BAC1] hover:text-white"
                    onClick={() => setShowReactionPicker(null)}
                  />
                </div>
                <EmojiPicker
                  onEmojiClick={(emojiObject) => {
                    onAddReaction && onAddReaction(msg.id, emojiObject.emoji);
                    setShowReactionPicker(null);
                  }}
                  theme={Theme.DARK}
                  emojiStyle={EmojiStyle.TWITTER}
                  width={320}
                  height={300}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-6 flex-shrink-0">
        {attachment && (
          <div className="bg-[#2B2D31] rounded-t-lg p-4 pb-2 relative w-full flex">
            <div className="relative group inline-block">
              {attachment.startsWith("data:image") ? (
                <img
                  src={attachment}
                  alt="Upload preview"
                  className="h-48 rounded object-contain bg-black/20"
                />
              ) : (
                <div className="h-24 w-64 bg-[#1E1F22] rounded flex items-center p-3 border border-[#35363C]">
                  <div className="w-12 h-12 bg-[#5865F2] rounded flex items-center justify-center mr-4">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-white font-medium text-sm truncate">
                      Ready to send file
                    </div>
                    <div className="text-[#949BA4] text-xs">
                      Standard attachment
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setAttachment(null)}
                className="absolute -top-2 -right-2 bg-[#F23F43] hover:bg-[#DA373C] text-white p-1 rounded-full shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="relative">
          {commandQuery !== null && filteredCommands.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-[600px] bg-[#2B2D31] border border-[#1E1F22] rounded-lg shadow-2xl overflow-hidden z-[100]">
              {filteredCommands[commandIndex]?.options && (
                <div className="border-b border-[#1E1F22]">
                  <div className="px-3 py-2 text-xs font-bold text-[#b5bac1] uppercase">
                    OPTIONS
                  </div>
                  <div className="px-1 pb-1">
                    {filteredCommands[commandIndex].options.map((opt, i) => (
                      <div key={i} className="flex px-3 py-2 items-center">
                        <span className="text-[#DBDEE1] font-medium w-32">
                          {opt.name}
                        </span>
                        <span className="text-[#949BA4] text-sm flex-1">
                          {opt.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                {filteredCommands.map((cmd, index) => (
                  <div
                    key={cmd.name}
                    onClick={() => insertCommand(cmd)}
                    className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer ${
                      index === commandIndex
                        ? "bg-[#404249]"
                        : "hover:bg-[#35373C]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#1E1F22] flex items-center justify-center text-[#B5BAC1]">
                      <span className="text-xl leading-none">/</span>
                    </div>
                    <div className="flex items-center flex-1 gap-2">
                      <span className="font-semibold text-[#DBDEE1]">
                        /{cmd.name}
                      </span>
                      <span className="text-sm text-[#949BA4]">{cmd.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mentionQuery !== null && filteredMentions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-[400px] bg-[#2B2D31] border border-[#1E1F22] rounded-lg shadow-2xl overflow-hidden z-[100]">
              <div className="bg-[#1E1F22] px-3 py-2 text-xs font-bold text-[#b5bac1] uppercase">
                Members Matching @{mentionQuery}
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                {filteredMentions.map((mention, index) => (
                  <div
                    key={mention.id}
                    onClick={() => insertMention(mention)}
                    className={`flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer ${
                      index === mentionIndex
                        ? "bg-[#404249]"
                        : "hover:bg-[#35373C]"
                    }`}
                  >
                    {mention.icon ? (
                      mention.type === "member" &&
                      mention.icon.startsWith("http") ? (
                        <img
                          src={mention.icon}
                          alt={mention.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center text-lg">
                          {mention.icon}
                        </div>
                      )
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#1E1F22] flex items-center justify-center text-[#B5BAC1]">
                        <Hash className="w-3 h-3" />
                      </div>
                    )}
                    <span
                      className="font-medium flex-1 truncate"
                      style={{ color: mention.color || "#DBDEE1" }}
                    >
                      {mention.name}
                    </span>
                    <span className="text-xs text-[#949BA4] max-w-[100px] truncate">
                      {mention.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div
            className={`bg-[#383A40] ${attachment ? "rounded-b-lg" : "rounded-lg"} p-2.5 flex items-center pr-4`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-[#B5BAC1] hover:text-[#DBDEE1] cursor-pointer mx-1 bg-[#4E5058] rounded-full hover:bg-[#6D6F78] transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder={`Message #${channel.name}`}
              className="flex-1 bg-transparent border-none outline-none text-[#DBDEE1] px-2 placeholder-[#72767D] font-medium h-6"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center space-x-3 text-gray-400 relative">
              <Gift className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
              <div className="uppercase font-bold text-sm bg-gray-600 rounded px-1 cursor-pointer hover:text-white hover:bg-gray-500">
                GIF
              </div>
              <Image
                onClick={() => fileInputRef.current?.click()}
                className="w-6 h-6 hover:text-white cursor-pointer transition-colors"
              />
              <Smile
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-6 h-6 hover:text-[hsl(47_86%_53%)] cursor-pointer transition-colors"
              />

              {showEmojiPicker && (
                <div
                  className="fixed bottom-20 right-8 z-[150] shadow-2xl bg-[#313338] p-2 rounded-lg border border-[#1E1F22]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="font-bold text-white text-sm">Emoji</span>
                    <X
                      className="w-4 h-4 cursor-pointer text-[#B5BAC1] hover:text-white"
                      onClick={() => setShowEmojiPicker(false)}
                    />
                  </div>
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setInputValue(
                        (prevInput) => prevInput + emojiObject.emoji,
                      );
                      // setShowEmojiPicker(false); // Optional: close on select
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
      </div>
    </div>
  );
}
