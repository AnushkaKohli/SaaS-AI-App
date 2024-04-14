import * as z from "zod";

export const musicSchema = z.object({
  // This is a validation for the prompt field
  prompt: z.string().min(1, {
    message: "Music prompt is required.",
  }),
});
