import CandidateContextBar from "@/components/layout/CandidateContextBar";

export default async function CandidateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="page-content">
      <CandidateContextBar slug={slug} />
      {children}
    </div>
  );
}
