"use client";
import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { cn } from "@/lib/utils";
import Sidebar from "../Sidebar";
import MessageContainer from "./MessageContainer";
import { User } from "@/db/dummy";
import { useSelectedUser } from "@/store/useSelectedUser";

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  users: User[];
}

const ChatLayout = ({ defaultLayout = [320, 480], users }: ChatLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedUser } = useSelectedUser();

  useEffect(() => {
    /**
     * Checks the current screen size and updates the isMobile state accordingly.
     *
     * @return {void}
     */
    const checkScreenSize = (): void => setIsMobile(window.innerWidth <= 768);

    // Check initial screen size
    checkScreenSize();

    // Listen for screen size changes
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <ResizablePanelGroup
      className="h-full bg-background rounded-lg"
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
      }}
    >
      <ResizablePanel
        className={cn(isCollapsed && "min-w-[80px] transition-all duration-300 ease-in-out")}
        defaultSize={defaultLayout[0]}
        collapsedSize={8}
        minSize={isMobile ? 0 : 24}
        maxSize={isMobile ? 8 : 30}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=true`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=false`;
        }}
        collapsible
      >
        <Sidebar isCollapsed={isCollapsed} users={users} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        {!selectedUser ? (
          <div className="flex justify-center items-center h-full w-full px-10">
            <div className="flex flex-col justify-center items-center gap-4">
              <img className="w-full md:w-2/3 lg:w-1/2" src="/logo.png" alt="logo" />
              <p className="text-muted-foreground text-center">
                Click on a chat to view the messages
              </p>
            </div>
          </div>
        ) : (
          <MessageContainer />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;
