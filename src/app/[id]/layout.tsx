"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";

const GameLayout = ({
  params,
  children,
}: Readonly<{
  params: { id: string };
  children: React.ReactNode;
}>) => {
  const playerName = localStorage.getItem("playerName");
  if (!playerName) {
    localStorage.setItem("playerName", prompt("Enter your name") ?? "");
  } else {
    const client = new Ably.Realtime({
      authUrl: `${process.env.NEXT_PUBLIC_HOSTNAME}/api/createTokenRequest`,
      authMethod: "POST",
      authParams: { playerName },
    });

    return (
      <AblyProvider client={client}>
        <ChannelProvider channelName={params.id.toLocaleLowerCase()}>
          {children}
        </ChannelProvider>
      </AblyProvider>
    );
  }
};

export default GameLayout;
