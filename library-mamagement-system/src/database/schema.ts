import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";

// Users table stays the same (keeping it simple for brevity)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  universityCard: text("university_card").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Books table is now a "Mirror" of API data
// We only insert rows here when a user interacts with a book
export const books = pgTable("books", {
  id: text("id").primaryKey(), // We will use the Google Books ID (e.g., "zyTCAlFPjgYC") directly
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverUrl: text("cover_url"),
  description: text("description"),
  publishedDate: text("published_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlist (Many-to-Many relationship between Users and Books)
export const wishlist = pgTable(
  "wishlist",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    bookId: text("book_id")
      .references(() => books.id)
      .notNull(),
    status: text("status").default("want_to_read"), // 'want_to_read', 'reading', 'completed'
    rating: doublePrecision("rating"), // 1-5 stars, null if not rated
    addedAt: timestamp("added_at").defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.bookId] }), // Composite key prevents duplicate entries
  ],
);
