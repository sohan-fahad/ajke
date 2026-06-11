import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { CommonsService } from "./commons.service";

const service = new CommonsService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM notifications").run();
  await env.DB.prepare("DELETE FROM testimonials").run();
  await env.DB.prepare("DELETE FROM feedbacks").run();
  await env.DB.prepare("DELETE FROM news_letter_subscribers").run();
});

describe("CommonsService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

// --- Notifications ---

describe("CommonsService.createNotification", () => {
  it("creates a notification", async () => {
    const created = await service.createNotification({ text: "Hello world" }, makeContext());

    expect(created.id).toBeDefined();
    expect(created.text).toBe("Hello world");
    expect(created.isActive).toBe(true);
  });
});

describe("CommonsService.createNotifications (batch)", () => {
  it("batch-inserts multiple notifications", async () => {
    const results = await service.createNotifications(
      [{ text: "Notif A" }, { text: "Notif B" }, { text: "Notif C" }],
      makeContext(),
    );

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.text).sort()).toEqual(["Notif A", "Notif B", "Notif C"].sort());

    const count = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM notifications",
    ).first<{ count: number }>();
    expect(count?.count).toBe(3);
  });

  it("returns empty array for empty payloads", async () => {
    const results = await service.createNotifications([], makeContext());
    expect(results).toEqual([]);
  });
});

describe("CommonsService.findAllNotifications", () => {
  it("returns empty when no notifications", async () => {
    const result = await service.findAllNotifications({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all notifications", async () => {
    await service.createNotifications(
      [{ text: "A" }, { text: "B" }],
      makeContext(),
    );
    const result = await service.findAllNotifications({}, makeContext());
    expect(result).toHaveLength(2);
  });
});

describe("CommonsService.updateNotification", () => {
  it("updates notification text", async () => {
    const created = await service.createNotification({ text: "Old text" }, makeContext());
    const updated = await service.updateNotification(created.id, { text: "New text" }, makeContext());

    expect(updated.id).toBe(created.id);
    expect(updated.text).toBe("New text");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when notification does not exist", async () => {
    await expect(
      service.updateNotification("nonexistent-id", { text: "X" }, makeContext()),
    ).rejects.toThrow("Notification not found");
  });
});

describe("CommonsService.removeNotification", () => {
  it("deletes a notification", async () => {
    const created = await service.createNotification({ text: "Delete me" }, makeContext());
    const result = await service.removeNotification(created.id, makeContext());

    expect(result.message).toBe("Deleted");

    const row = await env.DB.prepare("SELECT id FROM notifications WHERE id = ?")
      .bind(created.id)
      .first();
    expect(row).toBeNull();
  });
});

// --- Testimonials ---

describe("CommonsService.createTestimonials (batch)", () => {
  it("batch-inserts multiple testimonials", async () => {
    const results = await service.createTestimonials(
      [
        { customerName: "Alice", testimonial: "Great service!" },
        { customerName: "Bob", testimonial: "Loved it!" },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.customerName).sort()).toEqual(["Alice", "Bob"].sort());

    const count = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM testimonials",
    ).first<{ count: number }>();
    expect(count?.count).toBe(2);
  });
});

describe("CommonsService.findAllTestimonials", () => {
  it("returns all testimonials", async () => {
    await service.createTestimonial({ customerName: "Alice", testimonial: "Great!" }, makeContext());
    await service.createTestimonial({ customerName: "Bob", testimonial: "Awesome!" }, makeContext());

    const result = await service.findAllTestimonials({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by isActive", async () => {
    await service.createTestimonial({ customerName: "A", testimonial: "T", isActive: true }, makeContext());
    await service.createTestimonial({ customerName: "B", testimonial: "T", isActive: false }, makeContext());

    const active = await service.findAllTestimonials({ isActive: "true" }, makeContext());
    expect(active).toHaveLength(1);
    expect(active[0]?.customerName).toBe("A");
  });
});

describe("CommonsService.updateTestimonial", () => {
  it("updates testimonial and throws on missing id", async () => {
    const created = await service.createTestimonial(
      { customerName: "Alice", testimonial: "Old" },
      makeContext(),
    );
    const updated = await service.updateTestimonial(created.id, { testimonial: "Updated" }, makeContext());
    expect(updated.testimonial).toBe("Updated");

    await expect(
      service.updateTestimonial("nonexistent-id", { testimonial: "X" }, makeContext()),
    ).rejects.toThrow("Testimonial not found");
  });
});

// --- Feedbacks ---

describe("CommonsService.submitFeedbacks (batch)", () => {
  it("batch-inserts multiple feedbacks", async () => {
    const results = await service.submitFeedbacks(
      [
        { feedback: "Good product", tag: "PRODUCT" },
        { feedback: "Fast delivery", tag: "DELIVERY" },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.feedback).sort()).toEqual(
      ["Fast delivery", "Good product"].sort(),
    );
  });
});

describe("CommonsService.findAllFeedbacks", () => {
  it("returns all feedbacks", async () => {
    await service.submitFeedback({ feedback: "Nice" }, makeContext());
    await service.submitFeedback({ feedback: "Could be better" }, makeContext());

    const result = await service.findAllFeedbacks({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by tag", async () => {
    await service.submitFeedback({ feedback: "A", tag: "PRODUCT" }, makeContext());
    await service.submitFeedback({ feedback: "B", tag: "DELIVERY" }, makeContext());

    const result = await service.findAllFeedbacks({ tag: "PRODUCT" }, makeContext());
    expect(result).toHaveLength(1);
    expect(result[0]?.feedback).toBe("A");
  });
});

// --- Newsletter ---

describe("CommonsService.subscribe", () => {
  it("subscribes a new email", async () => {
    const sub = await service.subscribe("user@example.com", undefined, makeContext());
    expect(sub.id).toBeDefined();
    expect(sub.email).toBe("user@example.com");
  });

  it("returns existing subscription for duplicate email", async () => {
    const first = await service.subscribe("user@example.com", undefined, makeContext());
    const second = await service.subscribe("user@example.com", undefined, makeContext());

    expect(second.id).toBe(first.id);

    const count = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM news_letter_subscribers",
    ).first<{ count: number }>();
    expect(count?.count).toBe(1);
  });
});

describe("CommonsService.findAllSubscribers", () => {
  it("returns all subscribers", async () => {
    await service.subscribe("a@example.com", undefined, makeContext());
    await service.subscribe("b@example.com", undefined, makeContext());

    const result = await service.findAllSubscribers({}, makeContext());
    expect(result).toHaveLength(2);
  });
});
