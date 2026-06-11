import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

// Notification
export const CreateNotificationDTO = z.object({
    text: z.string("Text is required"),
    navigateTo: z.string().optional(),
});

export const FilterNotificationDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateNotificationDTO = z.object({
    text: z.string().optional(),
    navigateTo: z.string().optional(),
});

// Feedback
export const CreateFeedbackDTO = z.object({
    name: z.string().optional(),
    email: z.email().optional(),
    phoneNumber: z.string().optional(),
    tag: z.enum(["UI", "BUG", "FEATURE", "PERMORMANCE", "DOCUMENTATION", "OTHER"]).optional(),
    feedback: z.string("Feedback is required"),
    workspaceId: z.string().optional(),
});

export const FilterFeedbackDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateFeedbackDTO = z.object({
    name: z.string().optional(),
    email: z.email().optional(),
    phoneNumber: z.string().optional(),
    feedback: z.string().optional(),
    tag: z.enum(["UI", "BUG", "FEATURE", "PERMORMANCE", "DOCUMENTATION", "OTHER"]).optional(),
    status: z.enum(["PENDING", "RESOLVED", "REJECTED"]).optional(),
    workspaceId: z.string().optional(),
});

// Testimonial
export const CreateTestimonialDTO = z.object({
    customerName: z.string("Customer name is required"),
    customerDesignation: z.string().optional(),
    customerImage: z.string().optional(),
    testimonial: z.string("Testimonial is required"),
    rating: z.number().optional(),
    orderPriority: z.number().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterTestimonialDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateTestimonialDTO = z.object({
    customerName: z.string().optional(),
    customerDesignation: z.string().optional(),
    customerImage: z.string().optional(),
    testimonial: z.string().optional(),
    rating: z.number().optional(),
    orderPriority: z.number().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// NewsLetterSubscription
export const CreateNewsLetterSubscriptionDTO = z.object({
    email: z.email("Email is required"),
    workspaceId: z.string().optional(),
});

export const FilterNewsLetterSubscriptionDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateNewsLetterSubscriptionDTO = z.object({
    email: z.email("Email is required"),
    workspaceId: z.string().optional(),
});

export type CreateNotificationDTOType = z.infer<typeof CreateNotificationDTO>;
export type FilterNotificationDTOType = z.infer<typeof FilterNotificationDTO>;
export type UpdateNotificationDTOType = z.infer<typeof UpdateNotificationDTO>;
export type CreateFeedbackDTOType = z.infer<typeof CreateFeedbackDTO>;
export type FilterFeedbackDTOType = z.infer<typeof FilterFeedbackDTO>;
export type UpdateFeedbackDTOType = z.infer<typeof UpdateFeedbackDTO>;
export type CreateTestimonialDTOType = z.infer<typeof CreateTestimonialDTO>;
export type FilterTestimonialDTOType = z.infer<typeof FilterTestimonialDTO>;
export type UpdateTestimonialDTOType = z.infer<typeof UpdateTestimonialDTO>;
export type CreateNewsLetterSubscriptionDTOType = z.infer<typeof CreateNewsLetterSubscriptionDTO>;
export type FilterNewsLetterSubscriptionDTOType = z.infer<typeof FilterNewsLetterSubscriptionDTO>;
export type UpdateNewsLetterSubscriptionDTOType = z.infer<typeof UpdateNewsLetterSubscriptionDTO>;
