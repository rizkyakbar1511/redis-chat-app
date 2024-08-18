import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Loader, SendHorizontal, ThumbsUp } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import { Button } from "../ui/button";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreferences";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageAction } from "@/actions/message.action";
import { useSelectedUser } from "@/store/useSelectedUser";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import Image from "next/image";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { pusherClient } from "@/lib/pusher";
import { Message } from "@/db/dummy";

const ChatBottomBar = () => {
  const [message, setMessage] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedUser } = useSelectedUser();
  const { soundEnabled } = usePreferences();
  const { user: currentUser } = useKindeBrowserClient();

  const [playSound1] = useSound("/sounds/keystroke1.mp3");
  const [playSound2] = useSound("/sounds/keystroke2.mp3");
  const [playSound3] = useSound("/sounds/keystroke3.mp3");
  const [playSound4] = useSound("/sounds/keystroke1.mp3");
  const [playNotificationSound] = useSound("/sounds/notification.mp3");
  const playSounds = [playSound1, playSound2, playSound3, playSound4];

  const queryClient = useQueryClient();

  const playRandomKeyStrokeSound = () => {
    const randomIndex = Math.floor(Math.random() * playSounds.length);
    soundEnabled && playSounds[randomIndex]();
  };

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: sendMessageAction,
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessage({ content: message, messageType: "text", receiverId: selectedUser?.id! });
    setMessage("");

    textAreaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setMessage((prev) => prev + "\n");
    }
  };

  useEffect(() => {
    const channelName = `${currentUser?.id}_${selectedUser?.id}`.split("_").sort().join("_");
    const channel = pusherClient?.subscribe(channelName);

    const handleNewMessage = ({ message }: { message: Message }) => {
      queryClient.setQueryData(["messages", selectedUser?.id!], (prev: Message[]) => {
        return [...prev, message];
      });

      if (soundEnabled && message.senderId !== currentUser?.id) {
        playNotificationSound();
      }
    };

    channel.bind("newMessage", handleNewMessage);

    return () => {
      // ! abort the subscription
      channel.unbind("newMessage", handleNewMessage);
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUser?.id, queryClient, selectedUser?.id]);

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      {!message.trim() && (
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          onSuccess={(result, { widget }) => {
            setImgUrl((result.info as CloudinaryUploadWidgetInfo).secure_url);
            widget.close();
          }}
        >
          {({ open }) => (
            <ImageIcon
              onClick={() => open()}
              className="cursor-pointer text-muted-foreground"
              size={20}
            />
          )}
        </CldUploadWidget>
      )}
      <Dialog open={!!imgUrl}>
        <DialogContent>
          <DialogHeader>Image Preview</DialogHeader>
          <div className="flex justify-center items-center relative h-96 w-full mx-auto">
            <Image className="object-contain" src={imgUrl} alt="Image Preview" fill />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                sendMessage({
                  content: imgUrl,
                  messageType: "image",
                  receiverId: selectedUser?.id!,
                });
                setImgUrl("");
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        <motion.div
          className="w-full relative"
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.5 },
            layout: {
              type: "spring",
              bounce: 0.15,
            },
          }}
        >
          <Textarea
            className="w-full border rounded-full flex items-center h-9 resize-none overflow-hidden bg-background min-h-0"
            autoComplete="off"
            placeholder="Aa"
            rows={1}
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setMessage(e.target.value);
              playRandomKeyStrokeSound();
            }}
            ref={textAreaRef}
          />
          <div className="absolute right-2 bottom-0.5">
            <EmojiPicker
              onChange={(emoji) => {
                setMessage((prev) => `${prev}${emoji.native}`);
                textAreaRef.current?.focus();
              }}
            />
          </div>
        </motion.div>
        {message.trim() ? (
          <Button
            className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
            variant="ghost"
            size="icon"
            onClick={handleSendMessage}
          >
            {!isPending ? (
              <SendHorizontal size={20} />
            ) : (
              <Loader className="animate-spin" size={20} />
            )}
          </Button>
        ) : (
          <Button
            className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
            variant="ghost"
            size="icon"
          >
            {!isPending ? (
              <ThumbsUp
                size={20}
                onClick={() =>
                  sendMessage({ content: "👍", messageType: "text", receiverId: selectedUser?.id! })
                }
              />
            ) : (
              <Loader className="animate-spin" size={20} />
            )}
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBottomBar;
