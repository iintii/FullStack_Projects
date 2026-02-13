// the idea of product is to allow to bundle courses together. 
import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { CourseProductTable } from "./courseProds";

export const productStatuses = [
  "public",
  "private",
] as const; /*Used to mark products to be or not to be displayed. Without as const, an array ['public', 'private'] would be inferred as string[] (an array of any strings).
With as const, it's inferred as readonly ['public', 'private'] (a read-only tuple where the values are literally 'public' and 'private'). */
export type ProductStatus = (typeof productStatuses)[number];
export const ProductStatusEnum = pgEnum("product_status", productStatuses);

export const ProductTable = pgTable("products", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  imageUrl: text().notNull(),
  priceInDollars: integer().notNull(),
  status: ProductStatusEnum().notNull().default("private"),
  createdAt,
  updatedAt,
});

export const ProductRelationships = relations(ProductTable, ({ many }) => ({
  courseProducts: many(CourseProductTable),
}));
