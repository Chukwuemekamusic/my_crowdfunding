// app/categories/[id]/layout.tsx
import { Metadata } from "next";

const categories = [
  "Technology",
  "Art",
  "Community",
  "Business",
  "Charity",
  "Other",
];

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const categoryId = Number(id);

  // Validate category ID
  if (categoryId < 0 || categoryId > 5 || isNaN(categoryId)) {
    return {
      title: "Invalid Category | CrowdFund",
      description: "This category does not exist.",
    };
  }

  const category = categories[categoryId];

  return {
    title: `${category} Campaigns | CrowdFund`,
    description: `Browse and support ${category.toLowerCase()} projects on CrowdFund.`,
    openGraph: {
      title: `${category} Campaigns | CrowdFund`,
      description: `Browse and support ${category.toLowerCase()} projects on CrowdFund.`,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
