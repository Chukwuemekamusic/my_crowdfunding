// types/form.ts
export interface CampaignFormData {
  title: string;
  description: string;
  category: string;
  target: string;
  deadline: string;
  image: File | null;
  imageUrl?: string; // Add this for existing images
  allowFlexibleWithdrawal: boolean;
}

export type BasicInfoFormData = Pick<
  CampaignFormData,
  "title" | "description" | "category"
>;
export type FundingFormData = Pick<
  CampaignFormData,
  "target" | "deadline" | "allowFlexibleWithdrawal"
>;
export type MediaFormData = Pick<CampaignFormData, "image">;

export interface StepComponentProps {
  formData: CampaignFormData;
  onSubmit: (values: Partial<CampaignFormData>) => void;
}
