import { redirect } from "next/navigation";

type LegacySubcategoryPageProps = {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
};

export default async function LegacySubcategoryPage({
  params,
}: LegacySubcategoryPageProps) {
  const { category, subcategory } = await params;

  redirect(`/category/${category}/${subcategory}`);
}
