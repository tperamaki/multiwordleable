"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { use, useEffect, useState } from "react";

const GameLayout = ({
  params,
  children,
}: Readonly<{
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}>) => {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const { id } = use(params);

  useEffect(() => {
    let name = localStorage.getItem("playerName");
    if (!name) {
      name = prompt("Enter your name") ?? "";
      localStorage.setItem("playerName", name);
    }
    setClient(
      new Ably.Realtime({
        authUrl: `${process.env.NEXT_PUBLIC_HOSTNAME}/api/createTokenRequest`,
        authMethod: "POST",
        authParams: { playerName: name },
      })
    );
  }, []);

  return (
    client && (
      <AblyProvider client={client}>
        <ChannelProvider channelName={id.toLocaleLowerCase()}>
          {children}
        </ChannelProvider>
      </AblyProvider>
    )
  );
};

export default GameLayout;
