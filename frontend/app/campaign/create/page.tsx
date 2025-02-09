"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertTriangle,
  X,
} from "lucide-react";

// Step components
import BasicInfoForm from "./_components/steps/BasicInfoForm";
import FundingForm from "./_components/steps/FundingForm";
import MediaForm from "./_components/steps/MediaForm";
import PreviewStep from "./_components/steps/Preview";
import { useWeb3 } from "@/context";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const steps = [
  { id: 1, name: "Basic Info", component: BasicInfoForm },
  { id: 2, name: "Funding", component: FundingForm },
  { id: 3, name: "Media", component: MediaForm },
  { id: 4, name: "Preview", component: PreviewStep },
];

interface CompletedSteps {
  basicInfo: boolean;
  funding: boolean;
}

export default function CampaignCreationPage() {
  const { contract } = useWeb3();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showImageUploadRetryDialog, setShowImageUploadRetryDialog] =
    useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    target: "",
    deadline: "",
    image: null,
    allowFlexibleWithdrawal: false,
  });

  // Track completed steps
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({
    basicInfo: false,
    funding: false,
  });

  const progress = (currentStep / steps.length) * 100;

  // Check if basic info is complete
  const isBasicInfoComplete = (data: typeof formData) => {
    return (
      data.title.length >= 3 &&
      data.description.length >= 10 &&
      data.category !== ""
    );
  };

  // Check if funding info is complete
  const isFundingComplete = (data: typeof formData) => {
    return (
      data.target !== "" &&
      Number(data.target) > 0 &&
      data.deadline !== "" &&
      new Date(data.deadline) > new Date()
    );
  };

  // Check if we can show the draft button
  const canShowDraftButton = () => {
    // Must have completed both basic info and funding
    return completedSteps.basicInfo && completedSteps.funding;
  };

  const handleStepSubmit = (stepData: any) => {
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
    }
  };

  const handleSaveDraft = async () => {
    // Save to contract as draft
    if (!contract) return;

    try {
      setIsSaving(true);

      // If there's an image, upload it first
      let imageUrl = "";
      if (formData.image) {
        const data = new FormData();
        data.set("file", formData.image);
        console.log("file", formData.image);

        try {
          const uploadRequest = await fetch("/api/files", {
            method: "POST",
            body: data,
          });
          if (!uploadRequest.ok) {
            throw new Error("Failed to upload image");
          }
          imageUrl = await uploadRequest.json();
          toast.success(`Image uploaded`);
          //   console.log(`Image uploaded: ${imageUrl}`);
        } catch (error) {
          console.error("Error during image upload:", error);
          setShowImageUploadRetryDialog(true);
          return;
        }
      }

      // Prepare campaign input data
      const deadline = formData.deadline
        ? Math.floor(new Date(formData.deadline).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      const campaignInput = {
        title: formData.title || "Untitled Draft",
        description: formData.description || "",
        target: formData.target
          ? ethers.parseEther(formData.target)
          : ethers.parseEther("0"),
        deadline: BigInt(deadline),
        image: imageUrl,
        category: parseInt(formData.category || "0"),
        publishImmediately: false, // Always false for drafts
        allowFlexibleWithdrawal: formData.allowFlexibleWithdrawal,
      };

      // Save to blockchain
      const tx = await contract.createCampaign(campaignInput);
      await tx.wait();

      // Show success message
      toast.success("Draft saved successfully");

      // Redirect to drafts page
      router.push("/dashboard/drafts");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinueWithoutImage = () => {
    setShowImageUploadRetryDialog(false);
    setFormData((prev) => ({ ...prev, image: null }));
    handleSaveDraft();
  };

  const handleRetryImageUpload = () => {
    setShowImageUploadRetryDialog(false);
    handleSaveDraft();
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create Campaign</h1>
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
              {/* Show checkmark for completed steps */}
              {step.id < currentStep ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <div
                  className={`h-5 w-5 rounded-full border mr-2 flex items-center justify-center
                  ${
                    step.id === currentStep ? "border-primary" : "border-muted"
                  }`}
                >
                  {step.id}
                </div>
              )}
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
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="space-x-2">
              {canShowDraftButton() && (
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
              )}

              {currentStep < steps.length ? (
                <Button type="submit" form={`step-${currentStep}-form`}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" form="preview-form">
                  Create Campaign
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={showImageUploadRetryDialog}
        onOpenChange={setShowImageUploadRetryDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Image Upload Failed
            </AlertDialogTitle>
            <AlertDialogDescription>
              There was an error uploading your campaign image. Would you like
              to retry the upload or continue without an image? You can always
              add an image later by editing your draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowImageUploadRetryDialog(false)}
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueWithoutImage}>
              Continue Without Image
            </AlertDialogAction>
            <AlertDialogAction onClick={handleRetryImageUpload}>
              Retry Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
