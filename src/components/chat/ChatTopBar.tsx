import { Avatar, AvatarImage } from "../ui/avatar";
import { Info, XIcon } from "lucide-react";
import { useSelectedUser } from "@/store/useSelectedUser";

const ChatTopBar = () => {
  const { selectedUser, setSelectedUser } = useSelectedUser();
  return (
    <div className="flex h-20 w-full justify-between p-4 items-center border-b">
      <div className="flex items-center gap-2">
        <Avatar className="flex justify-center items-center">
          <AvatarImage
            className="w-10 h-10"
            src={selectedUser?.image || "/user-placeholder.png"}
            alt="User Avatar"
          />
        </Avatar>
        <span className="font-medium">{selectedUser?.name}</span>
      </div>
      <div className="flex gap-2">
        <Info className="text-muted-foreground cursor-pointer hover:text-primary" />
        <XIcon
          className="text-muted-foreground cursor-pointer hover:text-primary"
          onClick={() => setSelectedUser(null)}
        />
      </div>
    </div>
  );
};

export default ChatTopBar;
