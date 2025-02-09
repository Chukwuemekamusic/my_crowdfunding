// app/campaign/create/_components/steps
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface MediaFormData {
  image: File;
}

interface MediaFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    target: string;
    deadline: string;
    image: File | null;
    allowFlexibleWithdrawal: boolean;
  };
  onSubmit: (values: { image: File }) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  image: z
    .custom<File>()
    .refine((file) => file instanceof File, "Image is required")
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image must be less than 2MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});

export default function MediaForm({ formData, onSubmit }: MediaFormProps) {
  const [preview, setPreview] = useState<string | null>(
    formData.image ? URL.createObjectURL(formData.image) : null
  );

  const form = useForm<MediaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: formData.image || undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image", undefined as any);
    setPreview(null);
  };

  return (
    <Form {...form}>
      <form
        id="step-3-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Campaign Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {preview ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            document.getElementById("image")?.click()
                          }
                        >
                          Choose Image
                        </Button>
                        <p className="mt-2 text-sm text-muted-foreground">
                          PNG, JPG or WebP (max 2MB)
                        </p>
                      </div>
                      <input
                        id="image"
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        className="hidden"
                        onChange={handleImageChange}
                        {...field}
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload a compelling image that represents your campaign
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
