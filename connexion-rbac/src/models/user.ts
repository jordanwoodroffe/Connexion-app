import { z } from "zod";

export const userSchema = z.object({
  UserId: z.string(),
  Name: z.string(),
  Username: z.string(),
  Email: z.string().email(),
  Role: z.string(),
  PermissionsOverride: z.array(z.string()).optional(),
});
