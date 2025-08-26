import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerParticipant = mutation({
  args: {
    fullName: v.string(),
    collegeUniversity: v.string(),
    departmentYear: v.string(),
    contactNumber: v.string(),
    emailId: v.string(),
    teamName: v.optional(v.string()),
    teamSize: v.number(),
    roleInTeam: v.union(v.literal("Leader"), v.literal("Member")),
    technicalSkills: v.string(),
    previousExperience: v.optional(v.string()),
    agreeToRules: v.boolean(),
    ipAddress: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingRegistration = await ctx.db
      .query("participantRegistrations")
      .withIndex("by_email", (q) => q.eq("emailId", args.emailId))
      .first();

    if (existingRegistration) {
      throw new Error("Email already registered. Please use a different email address.");
    }

    // Validate required fields
    if (!args.agreeToRules) {
      throw new Error("You must agree to the rules and regulations to register.");
    }

    if (args.teamSize < 1 || args.teamSize > 10) {
      throw new Error("Team size must be between 1 and 10 members.");
    }

    // Insert the registration
    const registrationId = await ctx.db.insert("participantRegistrations", {
      ...args,
      registeredAt: Date.now()
    });

    return registrationId;
  },
});

export const getAllParticipantRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db
      .query("participantRegistrations")
      .collect();

    // Sort by registration date (newest first)
    return registrations.sort((a, b) => b.registeredAt - a.registeredAt);
  },
});

export const getParticipantRegistrationsByCollege = query({
  args: { college: v.string() },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("participantRegistrations")
      .withIndex("by_college", (q) => q.eq("collegeUniversity", args.college))
      .collect();

    return registrations;
  },
});

export const getRegistrationStats = query({
  args: {},
  handler: async (ctx) => {
    const allRegistrations = await ctx.db
      .query("participantRegistrations")
      .collect();

    const totalRegistrations = allRegistrations.length;
    
    // Group by college
    const collegeStats = allRegistrations.reduce((acc, reg) => {
      acc[reg.collegeUniversity] = (acc[reg.collegeUniversity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by team size
    const teamSizeStats = allRegistrations.reduce((acc, reg) => {
      const size = reg.teamSize.toString();
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent registrations (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = allRegistrations.filter(
      reg => reg.registeredAt > sevenDaysAgo
    ).length;

    return {
      totalRegistrations,
      collegeStats,
      teamSizeStats,
      recentRegistrations,
      topColleges: Object.entries(collegeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([college, count]) => ({ college, count }))
    };
  },
});

export const searchParticipantRegistrations = query({
  args: {
    searchTerm: v.optional(v.string()),
    college: v.optional(v.string()),
    teamSize: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let registrations = await ctx.db
      .query("participantRegistrations")
      .collect();

    // Sort by registration date (newest first)
    registrations = registrations.sort((a, b) => b.registeredAt - a.registeredAt);

    // Apply filters
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      registrations = registrations.filter(reg =>
        reg.fullName.toLowerCase().includes(searchLower) ||
        reg.emailId.toLowerCase().includes(searchLower) ||
        reg.teamName?.toLowerCase().includes(searchLower) ||
        reg.technicalSkills.toLowerCase().includes(searchLower)
      );
    }

    if (args.college) {
      registrations = registrations.filter(reg =>
        reg.collegeUniversity.toLowerCase().includes(args.college!.toLowerCase())
      );
    }

    if (args.teamSize) {
      registrations = registrations.filter(reg => reg.teamSize === args.teamSize);
    }

    return registrations;
  },
});

export const deleteParticipantRegistration = mutation({
  args: { registrationId: v.id("participantRegistrations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.registrationId);
    return { success: true };
  },
});

export const updateParticipantRegistration = mutation({
  args: {
    registrationId: v.id("participantRegistrations"),
    fullName: v.optional(v.string()),
    collegeUniversity: v.optional(v.string()),
    departmentYear: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    teamName: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    roleInTeam: v.optional(v.union(v.literal("Leader"), v.literal("Member"))),
    technicalSkills: v.optional(v.string()),
    previousExperience: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { registrationId, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(registrationId, filteredUpdates);
    return { success: true };
  },
});
