"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  Upload,
  Video,
  FileText,
  Type,
  Hash,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useFileUpload } from "@/hooks/useFileUpload";
import z from "zod";

// Form validation schema
const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  tags: z.string().refine((val) => {
    if (!val || val.trim().length === 0) return true; // Allow empty tags
    const tags = val.split(/[,\s]+/).filter((tag) => tag.trim().length > 0);
    return tags.every((tag) => tag.startsWith("#") && tag.length > 1);
  }, "Tags must start with # and be separated by commas or spaces (e.g., #gaming, #tutorial)"),
  video: z
    .any()
    .refine((files) => files?.length == 1, "Video file is required.")
    .refine(
      (files) => files?.[0]?.type?.startsWith("video/"),
      "Only video files are allowed."
    )
    .refine(
      (files) => files?.[0]?.size <= 100 * 1024 * 1024, // 100MB
      "Video file must be less than 100MB."
    ),
});

type FormData = z.infer<typeof formSchema>;

const FileUploadForm = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [currentTag, setCurrentTag] = React.useState("");

  // Use the file upload hook
  const { uploadFileMutation, progress, uploadedInfo, handleReset, status } =
    useFileUpload();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  // Update form tags when tags array changes
  React.useEffect(() => {
    form.setValue("tags", tags.join(" "));
  }, [tags, form]);

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTag = currentTag.trim().startsWith("#")
        ? currentTag.trim()
        : `#${currentTag.trim()}`;
      setTags([...tags, newTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsUploading(true);

    try {
      const videoFile = data.video?.[0];
      if (!videoFile) {
        throw new Error("No video file selected");
      }

      // Start the upload using the hook
      await uploadFileMutation.mutateAsync(videoFile);

      // Show success message
      toast.success("Video uploaded successfully!", {
        description: `"${data.title}" has been uploaded and stored on Filecoin.`,
        duration: 5000,
      });

      // Reset form after successful upload
      form.reset();
      setTags([]);
      setCurrentTag("");

      // Reset file input manually
      const fileInput = document.getElementById(
        "video-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed!", {
        description:
          error instanceof Error
            ? error.message
            : "There was an error uploading your video. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const watchedVideo = form.watch("video");
  const selectedFileName = watchedVideo?.[0]?.name || "";
  const isActuallyUploading = uploadFileMutation.isPending || isUploading;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-card border rounded-lg shadow-lg p-6">
        <div className="text-center space-y-1 mb-6">
          <div className="flex justify-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Video</h1>
          <p className="text-sm text-muted-foreground">
            Share your video content with the world
          </p>
        </div>

        {/* Upload Progress Section */}
        {(isActuallyUploading || uploadedInfo || status) && (
          <div className="mb-6 space-y-4">
            {/* Progress Bar */}
            {isActuallyUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Upload Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Status Message */}
            {status && (
              <Alert
                className={`${
                  progress === 100
                    ? "border-green-200 bg-green-50 dark:bg-green-950/30"
                    : "border-blue-200 bg-blue-50 dark:bg-blue-950/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {progress === 100 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-b-transparent" />
                  )}
                  <AlertDescription
                    className={`${
                      progress === 100
                        ? "text-green-800 dark:text-green-300"
                        : "text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    {status}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Upload Details */}
            {uploadedInfo && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Upload Details
                </h3>
                <div className="grid gap-2 text-sm">
                  {uploadedInfo.fileName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File:</span>
                      <span className="font-medium">
                        {uploadedInfo.fileName}
                      </span>
                    </div>
                  )}
                  {uploadedInfo.fileSize && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">
                        {(uploadedInfo.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  {uploadedInfo.pieceCid && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Piece CID:</span>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs max-w-32 truncate"
                      >
                        {uploadedInfo.pieceCid}
                      </Badge>
                    </div>
                  )}
                  {uploadedInfo.txHash && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Transaction:
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs max-w-32 truncate"
                      >
                        {uploadedInfo.txHash}
                      </Badge>
                    </div>
                  )}
                </div>
                {progress === 100 && (
                  <div className="pt-2 border-t">
                    <button
                      onClick={handleReset}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear upload details
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Grid Layout for Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Title and Description */}
              <div className="space-y-4">
                {/* Video Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Video Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter an engaging title for your video"
                          {...field}
                          disabled={isActuallyUploading}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a clear and descriptive title that represents
                        your video content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Video Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your video content, what viewers can expect to see..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          disabled={isActuallyUploading}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Provide a detailed description to help viewers
                        understand your content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column: Tags and Video Upload */}
              <div className="space-y-4">
                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Tags (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {/* Tag input with plus button */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a hashtag..."
                              value={currentTag}
                              onChange={(e) => setCurrentTag(e.target.value)}
                              onKeyPress={handleTagInputKeyPress}
                              disabled={isActuallyUploading}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addTag}
                              disabled={
                                !currentTag.trim() || isActuallyUploading
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Display added tags */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tags.map((tag, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                                >
                                  <span>{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    disabled={isActuallyUploading}
                                    className="hover:bg-primary/20 rounded-full p-1 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Hidden input for form validation */}
                          <input type="hidden" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add hashtags to help categorize your video. Click the +
                        button or press Enter to add tags.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Video File Upload */}
                <FormField
                  control={form.control}
                  name="video"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video File
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                            <Input
                              id="video-upload"
                              type="file"
                              accept="video/*"
                              onChange={(e) => onChange(e.target.files)}
                              disabled={isActuallyUploading}
                              className="hidden"
                            />
                            <label
                              htmlFor="video-upload"
                              className="cursor-pointer flex flex-col items-center space-y-1"
                            >
                              <Video className="h-8 w-8 text-muted-foreground" />
                              <div className="text-sm font-medium">
                                Click to upload video
                              </div>
                              <div className="text-xs text-muted-foreground">
                                MP4, MOV, AVI up to 100MB
                              </div>
                            </label>
                          </div>

                          {selectedFileName && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                              <Video className="h-3 w-3" />
                              <span className="truncate font-medium">
                                {selectedFileName}
                              </span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Upload your video file (Max size: 100MB). Supported
                        formats: MP4, MOV, AVI, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <div className="pt-3 border-t">
              <Button
                type="submit"
                disabled={isActuallyUploading}
                className="w-full"
                size="default"
              >
                {isActuallyUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    Uploading to Filecoin...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default FileUploadForm;
