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
  const client = new Ably.Realtime({
    authUrl: `${process.env.NEXT_PUBLIC_HOSTNAME}/api/createTokenRequest`,
    authMethod: "POST",
  });

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={params.id}>{children}</ChannelProvider>
    </AblyProvider>
  );
};

export default GameLayout;
