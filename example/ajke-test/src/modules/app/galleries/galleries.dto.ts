import { z } from "zod";

export const UploadFileFromUrlDTO = z.object({
    url: z.url("URL is required"),
    folder: z.string("Folder is required"),
    workspaceId: z.string().optional(),
});

export const FilterFileDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    folder: z.string().optional(),
    workspaceId: z.string().optional(),
});

export type UploadFileFromUrlDTOType = z.infer<typeof UploadFileFromUrlDTO>;
export type FilterFileDTOType = z.infer<typeof FilterFileDTO>;
