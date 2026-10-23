import { redirect } from 'next/navigation';

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/topics/${id}`);
}
