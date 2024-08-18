import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useSelectedUser } from "@/store/useSelectedUser";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/actions/message.action";
import { useEffect, useRef } from "react";
import MessageSkeleton from "../skeletons/MessageSkeleton";

const MessageList = () => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { selectedUser } = useSelectedUser();
  const { user: currentUser, isLoading: isLoadingCurrentUser } = useKindeBrowserClient();

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedUser?.id],
    queryFn: async () => await getMessages(selectedUser?.id!, currentUser?.id!),
    enabled: !!selectedUser && !!currentUser && !isLoadingCurrentUser,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="overflow-y-auto h-full" ref={messageContainerRef}>
      {/* Animation for new messages */}
      <AnimatePresence>
        {isLoadingMessages && (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        )}
        {!isLoadingMessages &&
          messages?.map((message, index) => (
            <motion.div
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-nowrap",
                message.senderId === currentUser?.id ? "items-end" : "items-start"
              )}
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
            >
              <div className="flex gap-3 items-center">
                {message.senderId === selectedUser?.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      className="border-2 border-white rounded-full"
                      src={selectedUser?.image || "/user-placeholder.png"}
                      alt="User Avatar"
                    />
                  </Avatar>
                )}
                {message.messageType === "text" ? (
                  <span className="bg-accent p-3 rounded-md max-w-xs">{message.content}</span>
                ) : (
                  <img
                    className="border p-2 rounded h-40 md:h-52 object-cover"
                    src={message.content}
                    alt="Message Image"
                  />
                )}
                {message.senderId === currentUser?.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      className="border-2 border-white rounded-full"
                      src={currentUser?.picture || "/user-placeholder.png"}
                      alt="User Avatar"
                    />
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
