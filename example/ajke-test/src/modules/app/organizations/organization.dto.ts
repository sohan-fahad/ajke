import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

export const CreateOrganizationDTO = z.object({
  name: z.string("Name is required"),
  domain: z.string("Domain is required"),
  logo: z.url().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  createdBy: z.uuid().optional(),
});

export const FilterOrganizationDTO = z.object({
  page: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().optional(),
  searchTerm: z.string().optional(),
  domain: z.string().optional(),
  isActive: boolQuery,
  orderBy: z.enum(["createdAt", "name", "domain", "updatedAt"]).optional(),
  orderDirection: z.enum(["ASC", "DESC"]).optional(),
});

export const UpdateOrganizationDTO = z.object({
  name: z.string().optional(),
  domain: z.string().optional(),
  subDomain: z.string().optional(),
  logo: z.url().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  updatedBy: z.uuid().optional(),
});

export type CreateOrganizationDTOType = z.infer<typeof CreateOrganizationDTO>;
export type FilterOrganizationDTOType = z.infer<typeof FilterOrganizationDTO>;
export type UpdateOrganizationDTOType = z.infer<typeof UpdateOrganizationDTO>;
