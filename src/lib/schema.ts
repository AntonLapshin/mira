import { z } from "zod";

export const todoItemStatusSchema = z.enum([
  "pending",
  "in-progress",
  "done",
  "approved",
  "revision",
  "blocked",
]);
export type TodoItemStatus = z.infer<typeof todoItemStatusSchema>;

export const todoItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  status: todoItemStatusSchema.default("pending"),
  branch: z.string().nullable().default(null),
  addedBy: z.enum(["pm", "reviewer"]).default("pm"),
  reviewNotes: z.string().nullable().default(null),
  order: z.number().int().default(0),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type TodoItem = z.infer<typeof todoItemSchema>;

export const buildPhaseSchema = z.enum([
  "planning",
  "building",
  "reviewing",
  "complete",
  "failed",
]);
export type BuildPhase = z.infer<typeof buildPhaseSchema>;

export const sessionSchema = z.object({
  id: z.string().min(1),
  description: z.string(),
  title: z.string().default(""),
  goal: z.string().default(""),
  phase: buildPhaseSchema.default("planning"),
  baseBranch: z.string().default(""),
  items: z.array(todoItemSchema).default([]),
  buildCycles: z.number().int().default(0),
  maxCycles: z.number().int().default(3),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type Session = z.infer<typeof sessionSchema>;
