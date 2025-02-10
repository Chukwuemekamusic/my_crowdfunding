"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, ArrowRight, Save } from "lucide-react";
import BasicInfoForm from "../../create/_components/steps/BasicInfoForm";
import FundingForm from "../../create/_components/steps/FundingForm";
import MediaForm from "../../create/_components/steps/MediaForm";
import { useWeb3 } from "@/context";
import { processCampaign } from "@/utils/contracts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import { CampaignFormData, StepComponentProps } from "@/types/form";
import { ethers } from "ethers";

interface CompletedSteps {
  basicInfo: boolean;
  funding: boolean;
}

type StepComponent = React.ComponentType<StepComponentProps>;

interface Step {
  id: number;
  name: string;
  component: StepComponent;
}

const steps: Step[] = [
  { id: 1, name: "Basic Info", component: BasicInfoForm },
  { id: 2, name: "Funding", component: FundingForm },
  { id: 3, name: "Media", component: MediaForm },
];

export default function EditCampaignPage() {
  const { id } = useParams();
  const router = useRouter();
  const { contract } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track completed steps
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({
    basicInfo: false,
    funding: false,
  });

  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    category: "",
    target: "",
    deadline: "",
    image: null,
    allowFlexibleWithdrawal: false,
  });

  // Check if basic info is complete
  const isBasicInfoComplete = (data: CampaignFormData) => {
    return (
      data.title.length >= 3 &&
      data.description.length >= 10 &&
      data.category !== ""
    );
  };

  // Check if funding info is complete
  const isFundingComplete = (data: CampaignFormData) => {
    return (
      data.target !== "" &&
      Number(data.target) > 0 &&
      data.deadline !== "" &&
      new Date(data.deadline) > new Date()
    );
  };

  // Check if we can show the save button
  const canShowSaveButton = () => {
    return (
      completedSteps.basicInfo && completedSteps.funding && currentStep === 3
    );
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!contract) return;

      try {
        setIsLoading(true);
        const campaign = await contract.campaigns(id);
        if (!campaign) {
          setError("Campaign not found");
          return;
        }

        const processedCampaign = processCampaign(campaign);
        const newFormData = {
          title: processedCampaign.title,
          description: processedCampaign.description,
          category: processedCampaign.category.toString(),
          target: ethers.formatEther(processedCampaign.target),
          deadline: new Date(Number(processedCampaign.deadline) * 1000)
            .toISOString()
            .slice(0, 16),
          image: null,
          imageUrl: processedCampaign.image,
          allowFlexibleWithdrawal: processedCampaign.allowFlexibleWithdrawal,
        };

        setFormData(newFormData);

        // Set initial completed steps based on fetched data
        setCompletedSteps({
          basicInfo: isBasicInfoComplete(newFormData),
          funding: isFundingComplete(newFormData),
        });
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError("Failed to load campaign");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [contract, id]);

  const handleStepSubmit = (stepData: Partial<CampaignFormData>) => {
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);

    // Update completed steps
    const newCompletedSteps = { ...completedSteps };
    switch (currentStep) {
      case 1:
        newCompletedSteps.basicInfo = isBasicInfoComplete(newFormData);
        break;
      case 2:
        newCompletedSteps.funding = isFundingComplete(newFormData);
        break;
    }
    setCompletedSteps(newCompletedSteps);

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!contract) return;

    try {
      setIsSaving(true);

      // Validate required fields
      if (!completedSteps.basicInfo || !completedSteps.funding) {
        toast.error("Please complete all required information before saving");
        return;
      }

      // Handle image upload if changed
      let imageUrl = null;
      if (formData.image) {
        const data = new FormData();
        data.set("file", formData.image);

        const uploadRequest = await fetch("/api/files", {
          method: "POST",
          body: data,
        });

        if (!uploadRequest.ok) {
          throw new Error("Failed to upload image");
        }

        imageUrl = await uploadRequest.json();
      }
      if (!formData.target) {
        toast.error("target can't be empty");
        return;
      }

      const target = ethers.parseEther(formData.target);

      const tx = await contract.updateDraftCampaign({
        id,
        title: formData.title,
        description: formData.description,
        target: target,
        deadline: BigInt(
          Math.floor(new Date(formData.deadline).getTime() / 1000)
        ),
        image: imageUrl || formData.imageUrl,
        category: Number(formData.category),
      });

      await tx.wait();
      toast.success("Campaign updated successfully");
      router.push("/dashboard/drafts");
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Failed to update campaign");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Edit Campaign</h1>
        <Progress value={progress} className="h-2" />
        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                  ? "text-muted-foreground"
                  : "text-muted"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full border mr-2 flex items-center justify-center
                ${step.id === currentStep ? "border-primary" : "border-muted"}`}
              >
                {step.id}
              </div>
              <span className="hidden sm:inline">{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CurrentStepComponent
            formData={formData}
            onSubmit={handleStepSubmit}
          />

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="space-x-2">
              {canShowSaveButton() ? (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  form={`step-${currentStep}-form`}
                  disabled={
                    (currentStep === 1 && !completedSteps.basicInfo) ||
                    (currentStep === 2 && !completedSteps.funding)
                  }
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
