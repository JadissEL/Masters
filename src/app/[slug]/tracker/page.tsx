import { redirect } from "next/navigation";

/** Legacy route — tracking lives on each programme / PhD page; explore uses filters. */
export default async function TrackerRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}/filter`);
}
