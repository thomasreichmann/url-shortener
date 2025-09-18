import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

export default async function RedirectPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id) || id < 0) redirect("/");

  const row = await api.url.getById({ id });
  if (!row) redirect("/");

  redirect(row.originalUrl);
}
