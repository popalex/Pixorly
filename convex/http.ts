import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk Webhook Handler
 *
 * Handles user sync events from Clerk:
 * - user.created: Create new user in Convex
 * - user.updated: Update user info in Convex
 * - user.deleted: Soft delete or cleanup user data
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();

    // Verify webhook signature (implement in production)
    // const svix = new Svix(process.env.CLERK_WEBHOOK_SECRET!);
    // const verified = svix.verify(payload, headers);

    const eventType = payload.type;

    switch (eventType) {
      case "user.created":
        await ctx.runMutation(api.users.createUser, {
          clerkId: payload.data.id,
          email: payload.data.email_addresses[0]?.email_address || "",
          firstName: payload.data.first_name,
          lastName: payload.data.last_name,
          username: payload.data.username,
          profileImage: payload.data.profile_image_url,
        });
        break;

      case "user.updated":
        await ctx.runMutation(api.users.updateUser, {
          clerkId: payload.data.id,
          email: payload.data.email_addresses[0]?.email_address,
          firstName: payload.data.first_name,
          lastName: payload.data.last_name,
          username: payload.data.username,
          profileImage: payload.data.profile_image_url,
        });
        break;

      case "user.deleted":
        await ctx.runMutation(api.users.deleteUser, {
          clerkId: payload.data.id,
        });
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
