import { createClient } from "@libsql/client";

const turso = createClient({
	url: Bun.env.DB_URL as string,
	authToken: Bun.env.DB_TOKEN as string,
});
const db = createClient({ url: "file:./sample.db" });

const tableSchema = await turso.execute(
	"select sql from sqlite_schema where type='table' and name = 'tana_links'",
);

const sampleRows = await turso.execute({
	sql: "select * from tana_links where rowid in (select rowid from tana_links order by random() limit :limit);",
	args: { limit: 200 },
});

const createTableSql = (tableSchema.rows[0].sql as string)
	.replace("CREATE TABLE", "CREATE TABLE IF NOT EXISTS")
	.replace("tana_", "")
	.replaceAll("`", "");

const insertSql = `insert into links values (${sampleRows.columns.map((col) => `:${col}`).join(", ")})`;

await db.execute(createTableSql);

for (const row of sampleRows.rows) {
	const { id, ...insert } = row;
	await db.execute({ sql: insertSql, args: insert });
}
