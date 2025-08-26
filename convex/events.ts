import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let events;
    
    if (args.category) {
      events = await ctx.db
        .query("events")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.status) {
      events = await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      events = await ctx.db.query("events").collect();
    }
    
    // Get organizer details for each event
    const eventsWithOrganizers = await Promise.all(
      events.map(async (event) => {
        const organizer = await ctx.db.get(event.organizerId);
        const organizerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", event.organizerId))
          .first();
        
        return {
          ...event,
          organizer: {
            name: organizer?.name || "Unknown",
            email: organizer?.email,
            profile: organizerProfile
          }
        };
      })
    );
    
    return eventsWithOrganizers;
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) return null;
    
    const organizer = await ctx.db.get(event.organizerId);
    const organizerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", event.organizerId))
      .first();
    
    // Get judge profiles
    const judges = await Promise.all(
      event.judges.map(async (judgeId) => {
        const judge = await ctx.db.get(judgeId);
        const judgeProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", judgeId))
          .first();
        return {
          id: judgeId,
          name: judge?.name || "Unknown",
          profile: judgeProfile
        };
      })
    );
    
    return {
      ...event,
      organizer: {
        name: organizer?.name || "Unknown",
        email: organizer?.email,
        profile: organizerProfile
      },
      judges
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    location: v.string(),
    maxParticipants: v.number(),
    registrationDeadline: v.string(),
    requirements: v.array(v.string()),
    prizes: v.array(v.object({
      position: v.string(),
      prize: v.string(),
      amount: v.optional(v.number())
    })),
    tags: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create events");
    }
    
    const eventId = await ctx.db.insert("events", {
      ...args,
      organizerId: userId,
      judges: [],
      status: "draft"
    });
    
    return eventId;
  },
});

export const register = mutation({
  args: {
    eventId: v.id("events"),
    submissionData: v.object({
      teamName: v.optional(v.string()),
      teamMembers: v.optional(v.array(v.string())),
      projectDescription: v.optional(v.string()),
      additionalInfo: v.optional(v.string()),
      // Enhanced registration fields
      experience: v.optional(v.string()),
      motivation: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      portfolio: v.optional(v.string()),
      github: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      website: v.optional(v.string()),
      emergencyContact: v.optional(v.object({
        name: v.string(),
        phone: v.string(),
        relationship: v.string()
      })),
      dietaryRestrictions: v.optional(v.string()),
      tshirtSize: v.optional(v.string()),
      agreeToTerms: v.boolean(),
      agreeToCodeOfConduct: v.boolean(),
      allowPhotography: v.optional(v.boolean())
    }),
    attachments: v.optional(v.array(v.id("files")))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to register");
    }

    // Check if already registered
    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("participantId"), userId))
      .first();

    if (existingRegistration) {
      throw new Error("Already registered for this event");
    }

    const registrationId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      participantId: userId,
      status: "pending",
      submissionData: {
        ...args.submissionData,
        // Provide defaults for required fields if not present
        agreeToTerms: args.submissionData.agreeToTerms ?? true,
        agreeToCodeOfConduct: args.submissionData.agreeToCodeOfConduct ?? true
      },
      attachments: args.attachments,
      registeredAt: Date.now()
    });

    return registrationId;
  },
});

export const getRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const registrationsWithParticipants = await Promise.all(
      registrations.map(async (registration) => {
        const participant = await ctx.db.get(registration.participantId);
        const participantProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", registration.participantId))
          .first();

        return {
          ...registration,
          participant: {
            name: participant?.name || "Unknown",
            email: participant?.email,
            profile: participantProfile
          }
        };
      })
    );

    return registrationsWithParticipants;
  },
});

// Judge Assignment Functions
export const getAvailableJudges = query({
  args: {},
  handler: async (ctx) => {
    const judgeProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "judge"))
      .collect();

    const judgesWithUserData = await Promise.all(
      judgeProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          user: {
            name: user?.name || "Unknown",
            email: user?.email
          }
        };
      })
    );

    return judgesWithUserData;
  },
});

export const assignJudgeToEvent = mutation({
  args: {
    eventId: v.id("events"),
    judgeId: v.id("users")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to assign judges");
    }

    // Check if user is admin or event organizer
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (userProfile?.role !== "admin" && event.organizerId !== userId) {
      throw new Error("Only admins and event organizers can assign judges");
    }

    // Check if judge is already assigned
    if (event.judges.includes(args.judgeId)) {
      throw new Error("Judge is already assigned to this event");
    }

    // Add judge to event
    await ctx.db.patch(args.eventId, {
      judges: [...event.judges, args.judgeId]
    });

    return { success: true };
  },
});

export const removeJudgeFromEvent = mutation({
  args: {
    eventId: v.id("events"),
    judgeId: v.id("users")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to remove judges");
    }

    // Check if user is admin or event organizer
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (userProfile?.role !== "admin" && event.organizerId !== userId) {
      throw new Error("Only admins and event organizers can remove judges");
    }

    // Remove judge from event
    await ctx.db.patch(args.eventId, {
      judges: event.judges.filter(id => id !== args.judgeId)
    });

    return { success: true };
  },
});

// Registration Management Functions
export const updateRegistrationStatus = mutation({
  args: {
    registrationId: v.id("registrations"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update registration status");
    }

    // Check if user has permission to review registrations
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Only admins, organizers, and judges can review registrations
    if (userProfile?.role !== "admin" &&
        event.organizerId !== userId &&
        !event.judges?.includes(userId)) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.registrationId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedBy: userId,
      reviewNotes: args.reviewNotes
    });

    return { success: true };
  },
});
