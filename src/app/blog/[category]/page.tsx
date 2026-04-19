import { redirect } from "next/navigation";

type LegacyCategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function LegacyCategoryPage({
  params,
}: LegacyCategoryPageProps) {
  const { category } = await params;

  redirect(`/category/${category}`);
}
