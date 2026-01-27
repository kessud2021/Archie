import Commands from "~/public/icons/book.png";
import Image from "next/image";
import Link from "next/link";
import Servers from "~/public/icons/iron-door.png";
import { AnimatedNumber } from "~/components/animations/number";
import { Background } from "~/components/ui/background";
import { Board } from "~/components/icons/board";
import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Discord } from "~/components/icons/discord";
import { Divider } from "~/components/ui/divider";
import { Wordmark } from "~/components/icons/logo";

export default async function Home() {

  return (
    <div className="relative">
      <div className="relative">
        <Background background="general" className="h-full" />
        <div
          className="absolute w-full h-full -z-10"
          style={{
            // Where the gradient ends needs to be added onto the padding bottom of the header so py-30 + pb-6 = pb-36
            background: "linear-gradient(180deg, transparent 80%, var(--color-blackify-950) calc(100% - (var(--spacing) * 6)))",
          }}
        />
        <div className="w-container flex flex-col-reverse lg:flex-row text-center gap-4 lg:gap-12 lg:text-start lg:justify-between items-center text-mc-white py-15 pb-21 lg:py-30 lg:pb-36">
          <div className="flex flex-col gap-10 lg:gap-6 md:max-w-[500px] xl:max-w-[600px]">
            <div className="flex flex-col gap-3">
              <Wordmark className="text-mc-6 xl:text-mc-10" />
              <p className="text-mc-2">
                The largest ArchMC Discord bot to view stats from any game on the ArchMC Network.
              </p>
            </div>
            <div className="flex flex-col lg:flex-row items-center flex-wrap gap-4 w-full">
              <DiscordInvite className="grow" />
              <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
            </div>
          </div>
      
        </div>
      </div>
      <div className="w-container flex items-center lg:-mt-20 gap-10 lg:gap-0 flex-col lg:flex-row justify-evenly">
        <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] lg:w-[20%]">
          <Image
            src={Servers}
            alt="servers"
            height={64}
            width={64}
            quality={100}
            className="mb-3"
            style={{ imageRendering: "pixelated" }}
          />
          <p className="text-center text-mc-3 text-mc-white font-bold">
            <AnimatedNumber value={100_000} />
          </p>
          <p className="text-center text-mc-2 text-mc-white">Servers</p>
        </Box>
        <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] lg:w-[20%]">
          <Image
            src={Commands}
            alt="commands"
            height={64}
            width={64}
            quality={100}
            style={{ imageRendering: "pixelated" }}
            className="mb-3"
          />
          <p className="text-center text-mc-3 text-mc-white font-bold"><AnimatedNumber value={50_000_000} /></p>
          <p className="text-center text-mc-2 text-mc-white">Commands Ran</p>
        </Box>
      </div>
      <div></div>
      <div className="bg-white/10 backdrop-blur-lg text-mc-white -mt-45 p-8 flex flex-col gap-6 w-container w-auto lg:w-[50%] text-balance text-center">
        <div className="flex flex-col gap-2">
          <p className="text-mc-3 lg:text-mc-4 font-bold">What are you waiting for?</p>
          <p className="text-mc-2">Invite Archie today to enhance your ArchMC experience!</p>
        </div>
        <DiscordInvite className="" />
      </div>
    </div>
  );
}

function DiscordInvite({ className = "" }: { className?: string }) {
  return (
    <Button className={`content:bg-discord-500 ${className}`} asChild>
      <Link href="/invite" prefetch={false}>
        <Discord className="drop-shadow-mc-1" />
        <p className="text-nowrap">Try On Discord</p>
      </Link>
    </Button>
  );
}

function BingoInvite() {
  return (
    <Button className="content:bg-green-500" asChild>
      <Link href="/players">
        <Board className="drop-shadow-mc-1" />
        <p className="text-nowrap">Bingo Tracker</p>
      </Link>
    </Button>
  );
}
