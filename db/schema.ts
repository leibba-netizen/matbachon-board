import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sharedState = sqliteTable("shared_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
