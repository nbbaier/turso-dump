import {
	getTableConfig,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name"),
});

export const book = sqliteTable("book", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name"),
	authorId: integer("author_id").references(() => user.id),
});

// const { columns, indexes, foreignKeys, checks, primaryKeys, name } =
console.log(
	getTableConfig(book).columns.map((item) => {
		return { item };
	}),
);
