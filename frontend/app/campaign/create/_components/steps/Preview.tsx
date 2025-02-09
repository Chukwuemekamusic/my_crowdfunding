// app/campaign/create/_components/steps
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
// import { ethers } from "ethers";

interface PreviewStepProps {
  formData: {
    title: string;
    description: string;
    category: string;
    target: string;
    deadline: string;
    image: File | null;
    allowFlexibleWithdrawal: boolean;
  };
  onSubmit: (values: { confirmed: boolean }) => void;
}

const categories = [
  "Technology",
  "Art",
  "Community",
  "Business",
  "Charity",
  "Other",
];

export default function PreviewStep({ formData, onSubmit }: PreviewStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ confirmed: true });
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">Preview Your Campaign</h2>
        <p className="text-sm text-muted-foreground">
          Review your campaign details before publishing
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {formData.image && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={URL.createObjectURL(formData.image)}
                  alt={formData.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{formData.title}</h1>
              <Badge variant="secondary">
                {categories[parseInt(formData.category)]}
              </Badge>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{formData.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Target Amount
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {formData.target} ETH
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Campaign Deadline
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {new Date(formData.deadline).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium">Withdrawal Policy</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formData.allowFlexibleWithdrawal
                  ? "Flexible withdrawals enabled - Funds can be withdrawn during the campaign"
                  : "Standard withdrawals - Funds can only be withdrawn after the campaign ends"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form id="preview-form" onSubmit={handleSubmit} />
    </div>
  );
}
