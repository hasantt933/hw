import { pgTable, serial, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const AIOutput= pgTable('AIOutput', {
    id:serial('id').primaryKey(),
    formData:varchar('formData').notNull(),
    aiResponse:text('aiResponse'),
    templateSlug:varchar('templateSlug').notNull(),
    createdBy:varchar('createdBy').notNull(),
    createdAt:varchar('createdAt')

})


export const subscriptions = pgTable('subscriptions', {
    id: serial('id').primaryKey(),
    email: varchar('email').notNull(),
    userName: varchar('userName').notNull(),
    active: boolean('active').notNull(), // true = active, false = canceled
    stripeCustomerId: varchar('stripeCustomerId').notNull().unique(),
    stripeSubscriptionId: varchar('stripeSubscriptionId').notNull().unique(),
    plan: varchar('plan').notNull(), // monthly or yearly
    currentPeriodEnd: timestamp('currentPeriodEnd').notNull(), // Subscription expiry date
    joinDate: timestamp('joinDate').defaultNow().notNull(), // User signup date
  });
  

