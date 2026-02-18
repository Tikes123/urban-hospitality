/**
 * Instructions: Your migration history and DB are out of sync ("modified after applied" + drift).
 * The cleanest fix is to reset and re-apply all migrations (this DELETES ALL DATA).
 *
 * Run this yourself in a terminal (Prisma will ask for confirmation):
 *
 *   npx prisma migrate reset
 *
 * Type "y" when asked. This will drop the database, recreate it, and run all migrations
 * from scratch. Use only on a development database.
 *
 * The migration 20260216180000_remove_designation has been fixed (FK dropped before index)
 * so it will apply cleanly on a fresh reset.
 */
console.log("Run in your terminal: npx prisma migrate reset");
console.log("(Confirm when prompted. This deletes all data and reapplies migrations.)");
