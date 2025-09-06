// utils/errorHandling.ts
import toast from "react-hot-toast";

/**
 * Comprehensive error handler for contract interactions
 * Handles both the new optimized contract errors and legacy errors
 */
export const handleContractError = (error: any, context?: string): string => {
  console.error(`Contract error${context ? ` in ${context}` : ''}:`, error);

  // Handle specific contract errors from the optimized contract
  if (error.reason || error.message) {
    const errorMessage = error.reason || error.message;

    // New CampaignLib errors
    if (errorMessage.includes("CampaignLib_InvalidTarget")) {
      const message = "Target amount must be greater than zero";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("CampaignLib_InvalidDeadline")) {
      const message = "Deadline must be in the future";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("CampaignLib_InvalidCategory")) {
      const message = "Invalid category selected";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("CampaignLib_InsufficientBalance")) {
      const message = "No funds available to withdraw";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("CampaignLib_CampaignActive")) {
      const message = "Cannot withdraw while campaign is active";
      toast.error(message);
      return message;
    }

    // Existing contract errors
    if (errorMessage.includes("ImageRequired")) {
      const message = "An image is required to publish a campaign";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("CampaignEnded")) {
      const message = "Campaign has ended and no longer accepts donations";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("CampaignNotPublished")) {
      const message = "Campaign is not published yet";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("NotDraftStatus")) {
      const message = "Campaign must be in draft status for this action";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("NotCampaignOwner")) {
      const message = "Only the campaign owner can perform this action";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("CampaignNotFound")) {
      const message = "Campaign not found";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("WithdrawalFailed")) {
      const message = "Failed to withdraw funds. Please try again";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("NoDonationsMade")) {
      const message = "No donations found for this address";
      toast.error(message);
      return message;
    }
    
    if (errorMessage.includes("ZeroDonation")) {
      const message = "Donation amount must be greater than zero";
      toast.error(message);
      return message;
    }
  }

  // Handle transaction errors
  if (error.code === "CALL_EXCEPTION") {
    const message = "Transaction failed. Please check your inputs and try again";
    toast.error(message);
    return message;
  }
  
  if (error.code === "INSUFFICIENT_FUNDS") {
    const message = "Insufficient funds for this transaction";
    toast.error(message);
    return message;
  }
  
  if (error.code === "USER_REJECTED") {
    const message = "Transaction was rejected by user";
    toast.error(message);
    return message;
  }
  
  if (error.code === "NETWORK_ERROR") {
    const message = "Network error. Please check your connection";
    toast.error(message);
    return message;
  }

  // Generic fallback
  const fallbackMessage = context 
    ? `Failed to ${context}. Please try again`
    : "An unexpected error occurred. Please try again";
  
  toast.error(fallbackMessage);
  return fallbackMessage;
};

/**
 * Network validation utility
 */
export const validateNetwork = async (chainId: number | null): Promise<boolean> => {
  const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  
  if (!expectedChainId) {
    console.warn("NEXT_PUBLIC_CHAIN_ID not configured");
    return true; // Allow if not configured
  }
  
  if (chainId !== Number(expectedChainId)) {
    const message = `Please switch to the correct network (Chain ID: ${expectedChainId})`;
    toast.error(message);
    return false;
  }
  
  return true;
};

/**
 * Wrapper for contract calls with error handling
 */
export const executeContractCall = async <T>(
  contractCall: () => Promise<T>,
  context: string,
  chainId?: number | null
): Promise<T | null> => {
  try {
    // Validate network if chainId provided
    if (chainId !== undefined && !(await validateNetwork(chainId))) {
      return null;
    }
    
    return await contractCall();
  } catch (error) {
    handleContractError(error, context);
    return null;
  }
};
