/**
 * Convex Authentication Configuration with Clerk
 *
 * This configuration enables Clerk authentication in Convex.
 * The JWT token from Clerk is verified and the user identity is extracted.
 *
 * Note: This is currently disabled for local development.
 * Uncomment and configure when setting up Clerk in Phase 1.4.
 */

// Temporarily disabled until Clerk is set up in Phase 1.4
// export default {
//   providers: [
//     {
//       domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
//       applicationID: "convex",
//     },
//   ],
// };

// Placeholder export for now
export default {
  providers: [],
};
