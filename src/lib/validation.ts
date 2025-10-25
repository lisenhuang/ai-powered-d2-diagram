import { z } from "zod";

export const diagramFormats = ["svg", "png"] as const;
export const builderModes = ["ai", "manual"] as const;

export const builderFormSchema = z.object({
  mode: z.enum(builderModes),
  prompt: z.string().optional(),
  code: z.string().optional(),
  format: z.enum(diagramFormats),
});

export const serverDiagramSchema = builderFormSchema
  .extend({
    theme: z.enum(["light", "dark"]),
    locale: z.string().default("en"),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "ai") {
      if (!values.prompt || values.prompt.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["prompt"],
          message: "Prompt required",
        });
      }
    } else if (!values.code || values.code.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["code"],
        message: "Code required",
      });
    }
  });

export type DiagramFormat = (typeof diagramFormats)[number];
export type BuilderMode = (typeof builderModes)[number];
export type DiagramRequestPayload = z.infer<typeof serverDiagramSchema>;
export type BuilderFormValues = z.infer<typeof builderFormSchema>;
