"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UserCampaignsList from "../campaigns/_components/UserCampaignsList";

export default function DraftsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Draft Campaigns</h1>
        <Link href="/campaign/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </Link>
      </div>

      <UserCampaignsList status="draft" />
    </div>
  );
}
