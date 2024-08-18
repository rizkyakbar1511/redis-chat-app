"use client";
import { MoonIcon, SunIcon, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { usePreferences } from "@/store/usePreferences";
import { useSound } from "use-sound";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const PreferencesTab = () => {
  const { setTheme } = useTheme();
  const { soundEnabled, setSoundEnabled } = usePreferences();
  const [playMouseClick] = useSound("/sounds/mouse-click.mp3");
  const [playSoundOn] = useSound("/sounds/sound-on.mp3", { volume: 0.3 });
  const [playSoundOff] = useSound("/sounds/sound-off.mp3", { volume: 0.3 });

  return (
    <div className="flex flex-wrap gap-2 px-1 md:px-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setTheme("light");
                soundEnabled && playMouseClick();
              }}
              variant="outline"
              size="icon"
            >
              <SunIcon className="size-[1.2rem] text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Light Mode</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setTheme("dark");
                soundEnabled && playMouseClick();
              }}
              variant="outline"
              size="icon"
            >
              <MoonIcon className="size-[1.2rem] text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dark Mode</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                soundEnabled ? playSoundOff() : playSoundOn();
              }}
              variant="outline"
              size="icon"
            >
              {soundEnabled ? (
                <Volume2 className="size-[1.2rem] text-muted-foreground" />
              ) : (
                <VolumeX className="size-[1.2rem] text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Sound</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default PreferencesTab;
