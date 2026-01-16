/**
 * Convex Authentication Configuration with Clerk
 *
 * This configuration enables Clerk authentication in Convex.
 * The JWT token from Clerk is verified and the user identity is extracted.
 */

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
