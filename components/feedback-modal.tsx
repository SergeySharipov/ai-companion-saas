"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/use-modal";
import { useToast } from "@/components/ui/use-toast";
import { MAX_CHAT_MESSAGE_LENGTH, FEEDBACK_MODAL } from "@/constants";

const FormSchema = z.object({
  feedback: z
    .string()
    .min(5, { message: "Feedback must be at least 5 characters." })
    .max(MAX_CHAT_MESSAGE_LENGTH, {
      message: `Feedback must not exceed ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
    }),
});

type FeedbackFormValues = z.infer<typeof FormSchema>;

export const FeedbackModal = () => {
  const modal = useModal(FEEDBACK_MODAL);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { feedback: "" },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.feedback }),
      });

      if (!res.ok) throw new Error("Failed to send feedback");

      toast({ description: "Thank you for your feedback!" });
      form.reset();
      modal.onClose();
    } catch (err) {
      toast({
        description: "Sorry, something went wrong. I'm working to fix it.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Send Feedback</DialogTitle>
          <DialogDescription>
            I appreciate your feedback — every message helps!
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your feedback"
                      className="min-h-[120px] resize-none rounded-lg bg-primary/10"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
