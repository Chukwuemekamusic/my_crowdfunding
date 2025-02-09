// app/campaign/create/_components/steps
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FundingFormData {
  target: string;
  deadline: string;
  allowFlexibleWithdrawal: boolean;
}

interface FundingFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    target: string;
    deadline: string;
    image: File | null;
    allowFlexibleWithdrawal: boolean;
  };
  onSubmit: (values: FundingFormData) => void;
}

const formSchema = z.object({
  target: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Target must be a positive number"
    ),
  deadline: z
    .string()
    .refine(
      (val) => new Date(val) > new Date(),
      "Deadline must be in the future"
    ),
  allowFlexibleWithdrawal: z.boolean(),
});

export default function FundingForm({ formData, onSubmit }: FundingFormProps) {
  const form = useForm<FundingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: formData.target || "",
      deadline: formData.deadline || "",
      allowFlexibleWithdrawal: formData.allowFlexibleWithdrawal || false,
    },
  });

  return (
    <Form {...form}>
      <form
        id="step-2-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Target (ETH)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter target amount in ETH"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Set a realistic funding goal for your campaign
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Deadline</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Choose when your campaign will end
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowFlexibleWithdrawal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <FormLabel className="mr-2">Flexible Withdrawal</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Allow withdrawing funds before the deadline</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormDescription>
                  Enable partial withdrawals during the campaign
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
