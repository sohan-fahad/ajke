import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { CommonsService } from "./commons.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateNotificationDTO, CreateNotificationDTOType,
  FilterNotificationDTO, FilterNotificationDTOType,
  UpdateNotificationDTO, UpdateNotificationDTOType,
  CreateTestimonialDTO, CreateTestimonialDTOType,
  FilterTestimonialDTO, FilterTestimonialDTOType,
  UpdateTestimonialDTO, UpdateTestimonialDTOType,
  UpdateFeedbackDTO, UpdateFeedbackDTOType,
  CreateFeedbackDTO, CreateFeedbackDTOType,
  FilterFeedbackDTO, FilterFeedbackDTOType,
  CreateNewsLetterSubscriptionDTO, CreateNewsLetterSubscriptionDTOType,
  FilterNewsLetterSubscriptionDTO, FilterNewsLetterSubscriptionDTOType,
} from "./commons.dto";

@Controller("/v1/panel/notifications")
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(@Inject(CommonsService) private readonly svc: CommonsService) {}

  @Get()
  @QueryValidate(FilterNotificationDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterNotificationDTOType;
    return ResponseUtil.success(c, await this.svc.findAllNotifications(q as any, c));
  }

  @Post()
  @ZodValidate(CreateNotificationDTO)
  async create(@Body() body: CreateNotificationDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createNotification(body, c), "Created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateNotificationDTO)
  async update(@Param("id") id: string, @Body() body: UpdateNotificationDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateNotification(id, body, c), "Updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.removeNotification(id, c));
  }
}

@Controller("/v1/panel/testimonials")
@UseGuards(AuthGuard)
export class TestimonialController {
  constructor(@Inject(CommonsService) private readonly svc: CommonsService) {}

  @Get()
  @QueryValidate(FilterTestimonialDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterTestimonialDTOType;
    return ResponseUtil.success(c, await this.svc.findAllTestimonials(q as any, c));
  }

  @Post()
  @ZodValidate(CreateTestimonialDTO)
  async create(@Body() body: CreateTestimonialDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createTestimonial(body, c), "Created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateTestimonialDTO)
  async update(@Param("id") id: string, @Body() body: UpdateTestimonialDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateTestimonial(id, body, c), "Updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.removeTestimonial(id, c));
  }
}

@Controller("/v1/web/testimonials")
export class TestimonialPublicController {
  constructor(@Inject(CommonsService) private readonly svc: CommonsService) {}

  @Get()
  @QueryValidate(FilterTestimonialDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterTestimonialDTOType;
    return ResponseUtil.success(c, await this.svc.findAllTestimonials({ ...q, isActive: true } as any, c));
  }
}

@Controller("/v1/panel/feedbacks")
@UseGuards(AuthGuard)
export class FeedbackPanelController {
  constructor(@Inject(CommonsService) private readonly svc: CommonsService) {}

  @Get()
  @QueryValidate(FilterFeedbackDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterFeedbackDTOType;
    return ResponseUtil.success(c, await this.svc.findAllFeedbacks(q as any, c));
  }

  @Patch("/:id")
  @ZodValidate(UpdateFeedbackDTO)
  async update(@Param("id") id: string, @Body() body: UpdateFeedbackDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateFeedback(id, body, c), "Updated");
  }
}

@Controller("/v1/web/feedbacks")
export class FeedbackPublicController {
  constructor(@Inject(CommonsService) private readonly svc: CommonsService) {}

  @Post()
  @ZodValidate(CreateFeedbackDTO)
  async submit(@Body() body: CreateFeedbackDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.submitFeedback(body, c), "Thank you for your feedback");
  }
}

@Controller("/v1/newsletter")
export class NewsletterController {
  constructor(@Inject(CommonsService) private readonly svc: CommonsService) {}

  @Post("/subscribe")
  @ZodValidate(CreateNewsLetterSubscriptionDTO)
  async subscribe(@Body() body: CreateNewsLetterSubscriptionDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.subscribe(body.email, body.workspaceId, c), "Subscribed");
  }

  @Get("/subscribers")
  @UseGuards(AuthGuard)
  @QueryValidate(FilterNewsLetterSubscriptionDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterNewsLetterSubscriptionDTOType;
    return ResponseUtil.success(c, await this.svc.findAllSubscribers(q as any, c));
  }
}
