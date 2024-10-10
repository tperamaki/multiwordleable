import Ably from "ably";
import { NextResponse } from "next/server";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

export const POST = async (request: Request) => {
  const data = await request.formData();
  const client = new Ably.Rest(process.env.ABLY_API_KEY ?? "");

  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals, colors],
    length: 2,
  });

  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: data.get("playerName") + "_" + randomName,
  });
  return NextResponse.json(tokenRequestData);
};
