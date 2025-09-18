import UrlShortener from "~/app/url-shortener";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <UrlShortener />
    </HydrateClient>
  );
}
