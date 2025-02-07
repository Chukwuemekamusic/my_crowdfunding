// page with pagination
import { Suspense } from "react";
import type { Metadata } from "next";
import CampaignsList from "@/components/CampaignsList";

export const metadata: Metadata = {
  title: "Crowdfunding Campaigns",
  description: "Explore and support innovative crowdfunding campaigns.",
};

export default async function Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Crowdfunding Campaigns</h1>
      <Suspense fallback={<div>Loading campaigns...</div>}>
        <CampaignsList />
      </Suspense>
    </main>
  );
}
