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

  // Use the enhanced file upload hook
  const {
    uploadFileMutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
    stage,
    detailedProgress,
    isUploading: isHookUploading,
    isSuccess,
    isError,
    error,
  } = useFileUpload();

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
  const isActuallyUploading =
    uploadFileMutation.isPending || isUploading || isHookUploading;

  return (
    <div className="w-full p-6">
      <div className="space-y-6">

        {/* Enhanced Upload Progress Section */}
        {(isActuallyUploading || uploadedInfo || status) && (
          <div className="mb-6 space-y-4 border rounded-lg p-4 bg-muted/20">
            {/* Enhanced Progress Bar with Stage Indicators */}
            {isActuallyUploading && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Upload Progress</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {progress}%
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {progress < 100 ? "Uploading..." : "Complete!"}
                    </div>
                  </div>
                </div>

                {/* Main Progress Bar */}
                <div className="space-y-1">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Detailed Progress Steps */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <div
                    className={`text-xs p-2 rounded border ${
                      progress >= 20
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-muted border-muted-foreground/20"
                    }`}
                  >
                    <div className="font-medium">💰 Payment Setup</div>
                    <div className="text-xs opacity-70">
                      {progress >= 20
                        ? "✓ Complete"
                        : progress >= 5
                        ? "In Progress..."
                        : "Pending"}
                    </div>
                  </div>

                  <div
                    className={`text-xs p-2 rounded border ${
                      progress >= 50
                        ? "bg-green-50 border-green-200 text-green-700"
                        : progress >= 25
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-muted border-muted-foreground/20"
                    }`}
                  >
                    <div className="font-medium">🔗 Storage Setup</div>
                    <div className="text-xs opacity-70">
                      {progress >= 50
                        ? "✓ Complete"
                        : progress >= 25
                        ? "In Progress..."
                        : "Pending"}
                    </div>
                  </div>

                  <div
                    className={`text-xs p-2 rounded border ${
                      progress >= 80
                        ? "bg-green-50 border-green-200 text-green-700"
                        : progress >= 55
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-muted border-muted-foreground/20"
                    }`}
                  >
                    <div className="font-medium">📁 File Upload</div>
                    <div className="text-xs opacity-70">
                      {progress >= 80
                        ? "✓ Complete"
                        : progress >= 55
                        ? "In Progress..."
                        : "Pending"}
                    </div>
                  </div>

                  <div
                    className={`text-xs p-2 rounded border ${
                      progress >= 100
                        ? "bg-green-50 border-green-200 text-green-700"
                        : progress >= 85
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-muted border-muted-foreground/20"
                    }`}
                  >
                    <div className="font-medium">✅ Confirmation</div>
                    <div className="text-xs opacity-70">
                      {progress >= 100
                        ? "✓ Complete"
                        : progress >= 85
                        ? "In Progress..."
                        : "Pending"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Status Message */}
            {status && (
              <Alert
                className={`${
                  progress === 100
                    ? "border-green-200 bg-green-50 dark:bg-green-950/30"
                    : "border-blue-200 bg-blue-50 dark:bg-blue-950/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {progress === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-b-transparent flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <AlertDescription
                      className={`font-medium ${
                        progress === 100
                          ? "text-green-800 dark:text-green-300"
                          : "text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {status}
                    </AlertDescription>
                    {progress < 100 && progress > 0 && (
                      <div className="text-xs opacity-70 mt-1">
                        This may take a few minutes depending on file size and
                        network conditions.
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            {/* Enhanced Upload Details */}
            {uploadedInfo && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-5 space-y-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Upload Successful!
                </h3>

                <div className="grid gap-3 text-sm">
                  {uploadedInfo.fileName && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        File Name:
                      </span>
                      <span
                        className="font-semibold text-right max-w-48 truncate"
                        title={uploadedInfo.fileName}
                      >
                        {uploadedInfo.fileName}
                      </span>
                    </div>
                  )}

                  {uploadedInfo.fileSize && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        File Size:
                      </span>
                      <span className="font-semibold">
                        {(uploadedInfo.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  )}

                  {uploadedInfo.dataSetId && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Dataset ID:
                      </span>
                      <Badge variant="secondary" className="font-mono">
                        #{uploadedInfo.dataSetId}
                      </Badge>
                    </div>
                  )}

                  {uploadedInfo.pieceId !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Piece ID:
                      </span>
                      <Badge variant="secondary" className="font-mono">
                        #{uploadedInfo.pieceId}
                      </Badge>
                    </div>
                  )}

                  {uploadedInfo.providerAddress && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Storage Provider:
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs max-w-32 truncate"
                        title={uploadedInfo.providerAddress}
                      >
                        {uploadedInfo.providerAddress.slice(0, 6)}...
                        {uploadedInfo.providerAddress.slice(-4)}
                      </Badge>
                    </div>
                  )}

                  {uploadedInfo.pieceCid && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Piece CID:
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs max-w-40 truncate cursor-pointer hover:bg-accent"
                        title={`Click to copy: ${uploadedInfo.pieceCid}`}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            uploadedInfo.pieceCid || ""
                          );
                          toast.success("Piece CID copied to clipboard!");
                        }}
                      >
                        {uploadedInfo.pieceCid.slice(0, 8)}...
                        {uploadedInfo.pieceCid.slice(-8)}
                      </Badge>
                    </div>
                  )}

                  {uploadedInfo.txHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Transaction Hash:
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs max-w-32 truncate cursor-pointer hover:bg-accent"
                        title={`Click to copy: ${uploadedInfo.txHash}`}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            uploadedInfo.txHash || ""
                          );
                          toast.success(
                            "Transaction hash copied to clipboard!"
                          );
                        }}
                      >
                        {uploadedInfo.txHash.slice(0, 6)}...
                        {uploadedInfo.txHash.slice(-6)}
                      </Badge>
                    </div>
                  )}
                </div>

                {progress === 100 && (
                  <div className="pt-3 border-t border-green-200 dark:border-green-800 flex justify-between items-center">
                    <div className="text-xs text-green-700 dark:text-green-300">
                      🎉 Your file is now stored permanently on Filecoin!
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-white/50 dark:hover:bg-black/20"
                    >
                      Clear details
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
