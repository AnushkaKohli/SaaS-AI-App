import * as z from "zod";

export const conversationSchema = z.object({
  // This is a validation for the prompt field
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
});
