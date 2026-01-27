import { BaseSection } from "./base-section";
import { Command } from "~/components/ui/command";
import { PlayerProvider } from "~/app/players/[slug]/context";
import { SessionAnimation } from "../session-animation";
import type { Player } from "@statsify/schemas";

export function SessionSection({ player }: { player: Player }) {
  return (
    <BaseSection
      background="woolgames"
      className="flex-col items-center relative"
    >
      <div className="mx-4 lg:mx-0 flex flex-col gap-4 max-w-120 xl:max-w-200 text-mc-white text-center lg:text-start">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow text-center">
          Sessions
        </h1>
        <p className="text-mc-1.75 lg:text-mc-2 leading-6 text-center">
          Archie allows you to display your stats within sessions. You can
          tracking your stats and check your progress at the end of the day! Use
          the sessions stats with the <Command command="/session" /> command
          followed by the game of your choice, such as{" "}
          <Command command="/session woolgames" />. &quot;But my past losses?&quot; you
          might say, there is no worry! You can reset your session at any time
          with <Command command="/reset session" />.
        </p>
      </div>
      <PlayerProvider player={player}>
        <SessionAnimation />
      </PlayerProvider>
    </BaseSection>
  );
}
