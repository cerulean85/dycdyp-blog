import { redirect } from "next/navigation";

type LegacyPostPageProps = {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
};

export default async function LegacyPostPage({ params }: LegacyPostPageProps) {
  const { category, subcategory, slug } = await params;

  redirect(`/category/${category}/${subcategory}/${slug}`);
}
