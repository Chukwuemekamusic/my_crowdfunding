//app/categories/page.tsx
import {
  Rocket,
  Palette,
  Users,
  Building2,
  Heart,
  PlusCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

const categories = [
  {
    id: 0,
    name: "Technology",
    icon: Rocket,
    description:
      "Innovative tech projects, software, hardware, and digital solutions",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: 1,
    name: "Art",
    icon: Palette,
    description:
      "Creative projects in visual arts, music, film, and digital media",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: 2,
    name: "Community",
    icon: Users,
    description:
      "Local initiatives, social projects, and community development",
    color: "bg-green-500/10 text-green-500",
  },
  {
    id: 3,
    name: "Business",
    icon: Building2,
    description: "Startups, small businesses, and entrepreneurial ventures",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    id: 4,
    name: "Charity",
    icon: Heart,
    description:
      "Nonprofit causes, humanitarian aid, and charitable initiatives",
    color: "bg-red-500/10 text-red-500",
  },
  {
    id: 5,
    name: "Other",
    icon: PlusCircle,
    description: "Unique projects that don't fit traditional categories",
    color: "bg-gray-500/10 text-gray-500",
  },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-2">
          Explore campaigns by category or browse all projects.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
