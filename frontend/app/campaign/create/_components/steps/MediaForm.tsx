// app/campaign/create/_components/steps/MediaForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
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
  image: File | null;
}

interface MediaFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    target: string;
    deadline: string;
    image: File | null;
    imageUrl?: string;
    allowFlexibleWithdrawal: boolean;
  };
  onSubmit: (values: { image: File | null }) => void;
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
    .nullable()
    .refine((file) => {
      if (!file) return true; // Allow null
      return file instanceof File;
    }, "Invalid file")
    .refine((file) => {
      if (!file) return true;
      return file.size <= MAX_FILE_SIZE;
    }, "Image must be less than 2MB")
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Only .jpg, .jpeg, .png and .webp formats are supported"),
});

export default function MediaForm({ formData, onSubmit }: MediaFormProps) {
  // Initialize preview from either existing image file or URL
  const [preview, setPreview] = useState<string | null>(() => {
    if (formData.image) {
      return URL.createObjectURL(formData.image);
    }
    return formData.imageUrl || null;
  });

  const form = useForm<MediaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: formData.image || null,
    },
  });

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("http")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      try {
        // Validate file before setting
        await formSchema.parseAsync({ image: file });

        // Update preview
        if (preview && !preview.startsWith("http")) {
          URL.revokeObjectURL(preview);
        }
        const newPreview = URL.createObjectURL(file);
        setPreview(newPreview);

        // Update form state
        form.setValue("image", file);

        // Immediately notify parent component
        onSubmit({ image: file });
      } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors[0]?.message || "Invalid file";
          form.setError("image", { message: errorMessage });
        }
      }
    }
  };

  const handleRemoveImage = () => {
    // Cleanup existing preview URL
    if (preview && !preview.startsWith("http")) {
      URL.revokeObjectURL(preview);
    }

    // Reset state
    setPreview(null);
    form.setValue("image", null);

    // Notify parent component
    onSubmit({ image: null });
  };

  // Handle form submission (might still be needed for validation)
  const onFormSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <Form {...form}>
      <form id="step-3-form" onSubmit={onFormSubmit} className="space-y-6">
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
