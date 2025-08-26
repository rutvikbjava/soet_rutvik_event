import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Super Admin credentials (hardcoded for security)
const SUPER_ADMIN_EMAIL = "rutvikburra@gmail.com";
const SUPER_ADMIN_PASSWORD = "rutvikburra1234567890@#E";

export const authenticateSuperAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (ctx, args) => {
    console.log("Super admin authentication attempt:", {
      providedEmail: args.email,
      expectedEmail: SUPER_ADMIN_EMAIL,
      emailMatch: args.email === SUPER_ADMIN_EMAIL,
      providedPasswordLength: args.password.length,
      expectedPasswordLength: SUPER_ADMIN_PASSWORD.length,
      passwordMatch: args.password === SUPER_ADMIN_PASSWORD
    });

    if (args.email === SUPER_ADMIN_EMAIL && args.password === SUPER_ADMIN_PASSWORD) {
      console.log("Super admin authentication successful");
      return { success: true, isSuperAdmin: true };
    }

    console.log("Super admin authentication failed");
    throw new Error("Invalid super admin credentials");
  },
});

export const createOrganizerJudge = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("organizer"), v.literal("judge")),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    // Check if email already exists
    const existingCredential = await ctx.db
      .query("organizerCredentials")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingCredential) {
      throw new Error("Email already exists");
    }

    // Create organizer/judge credential
    const credentialId = await ctx.db.insert("organizerCredentials", {
      email: args.email,
      password: args.password,
      role: args.role,
      firstName: args.firstName,
      lastName: args.lastName,
      organization: args.organization,
      isActive: true,
      createdAt: Date.now(),
      createdBy: args.superAdminEmail,
      passwordResetRequired: false
    });

    return credentialId;
  },
});

export const getAllOrganizersJudges = query({
  args: {
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    const credentials = await ctx.db
      .query("organizerCredentials")
      .collect();

    return credentials.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateOrganizerJudgePassword = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    newPassword: v.string(),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    await ctx.db.patch(args.credentialId, {
      password: args.newPassword,
      passwordResetRequired: false
    });

    return { success: true };
  },
});

export const toggleOrganizerJudgeStatus = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    isActive: v.boolean(),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    await ctx.db.patch(args.credentialId, {
      isActive: args.isActive
    });

    return { success: true };
  },
});

export const deleteOrganizerJudge = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    await ctx.db.delete(args.credentialId);
    return { success: true };
  },
});

export const authenticateOrganizerJudge = mutation({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query("organizerCredentials")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!credential) {
      throw new Error("Invalid credentials");
    }

    if (!credential.isActive) {
      throw new Error("Account is deactivated");
    }

    if (credential.password !== args.password) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    await ctx.db.patch(credential._id, {
      lastLogin: Date.now()
    });

    return {
      success: true,
      role: credential.role,
      firstName: credential.firstName,
      lastName: credential.lastName,
      organization: credential.organization,
      passwordResetRequired: credential.passwordResetRequired
    };
  },
});

export const getOrganizerJudgeStats = query({
  args: {
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    const allCredentials = await ctx.db
      .query("organizerCredentials")
      .collect();

    const totalOrganizers = allCredentials.filter(c => c.role === "organizer").length;
    const totalJudges = allCredentials.filter(c => c.role === "judge").length;
    const activeAccounts = allCredentials.filter(c => c.isActive).length;
    const inactiveAccounts = allCredentials.filter(c => !c.isActive).length;

    // Recent logins (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentLogins = allCredentials.filter(c => 
      c.lastLogin && c.lastLogin > sevenDaysAgo
    ).length;

    return {
      totalOrganizers,
      totalJudges,
      activeAccounts,
      inactiveAccounts,
      recentLogins,
      totalAccounts: allCredentials.length
    };
  },
});

export const updateOrganizerJudgeInfo = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    organization: v.optional(v.string()),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    const { credentialId, superAdminEmail, superAdminPassword, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(credentialId, filteredUpdates);
    return { success: true };
  },
});

// Function to create default test accounts
export const createDefaultAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if any accounts already exist
    const existingAccounts = await ctx.db
      .query("organizerCredentials")
      .collect();

    if (existingAccounts.length > 0) {
      return { message: "Default accounts already exist" };
    }

    // Create default organizer account
    await ctx.db.insert("organizerCredentials", {
      email: "organizer@test.com",
      password: "organizer123",
      role: "organizer",
      firstName: "Test",
      lastName: "Organizer",
      organization: "Test Organization",
      isActive: true,
      createdAt: Date.now(),
      createdBy: SUPER_ADMIN_EMAIL,
      passwordResetRequired: false
    });

    // Create default judge account
    await ctx.db.insert("organizerCredentials", {
      email: "judge@test.com",
      password: "judge123",
      role: "judge",
      firstName: "Test",
      lastName: "Judge",
      organization: "Test Organization",
      isActive: true,
      createdAt: Date.now(),
      createdBy: SUPER_ADMIN_EMAIL,
      passwordResetRequired: false
    });

    return {
      success: true,
      message: "Default accounts created",
      accounts: [
        { email: "organizer@test.com", password: "organizer123", role: "organizer" },
        { email: "judge@test.com", password: "judge123", role: "judge" }
      ]
    };
  },
});
