// components/navigation/NavigationLink.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/types/navigation";

interface NavigationLinkProps {
  item: NavigationItem;
}

export const NavigationLink = ({ item }: NavigationLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.name}</span>
    </Link>
  );
};
