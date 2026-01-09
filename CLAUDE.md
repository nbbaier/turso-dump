# CLAUDE.md - AI Assistant Guide for turso-dump

## Project Overview

**turso-dump** is a utility for dumping and restoring data from Turso databases (libSQL/SQLite). This is currently an experimental project that works with specific database tables and is intended to evolve into a full-featured CLI tool.

**Status**: Early development / Experimental
**Runtime**: Bun
**Primary Use Case**: Dumping sample data from remote Turso databases to local SQLite files

## Technology Stack

- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript (strict mode enabled)
- **Database Client**: @libsql/client v0.14.0
- **ORM**: Drizzle ORM v0.36.4 (for schema definitions)
- **Data Parsing**: PapaParse v5.4.1 (CSV parsing capabilities)
- **TypeScript**: v5.0.0+

## Codebase Structure

```
turso-dump/
├── index.ts          # Main entry point - database dump logic
├── schema.ts         # Drizzle ORM schema definitions (example/test code)
├── package.json      # Dependencies and project metadata
├── tsconfig.json     # TypeScript configuration
├── bun.lockb         # Bun lockfile
├── .gitignore        # Git ignore patterns (includes *.db files)
└── README.md         # Basic project description
```

### Key Files Explained

#### `index.ts` (Main Script)

**Purpose**: Dumps sample data from a remote Turso database to a local SQLite file

**Workflow**:
1. Connects to remote Turso database using environment variables
2. Creates local SQLite database (`sample.db`)
3. Fetches table schema for `tana_links` table
4. Retrieves 200 random sample rows
5. Creates local table with modified schema (removes `tana_` prefix)
6. Inserts sample rows into local database

**Environment Variables Required**:
- `DB_URL`: Turso database URL
- `DB_TOKEN`: Turso authentication token

**Current Limitations**:
- Hardcoded to work with `tana_links` table only
- Fixed sample size of 200 rows
- Basic insert loop (not optimized for large datasets)

#### `schema.ts` (Schema Definitions)

**Purpose**: Example Drizzle ORM schema definitions

**Tables Defined**:
- `user`: Simple user table with id (autoincrement) and name
- `book`: Book table with author relationship

**Current State**: Appears to be test/example code for exploring Drizzle's `getTableConfig` API. Not directly used by the main dump logic.

#### `tsconfig.json` (TypeScript Configuration)

**Key Settings**:
- Target: ESNext
- Module: ESNext with bundler resolution
- Strict mode: Enabled
- No emit (Bun handles execution directly)
- Allows importing .ts extensions (Bun-specific)

## Development Setup

### Prerequisites

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install
```

### Environment Configuration

Create a `.env` file in the project root (not tracked in git):

```env
DB_URL=libsql://your-database.turso.io
DB_TOKEN=your_auth_token_here
```

### Running the Script

```bash
# Execute the main script
bun run index.ts
```

**Expected Output**: Creates `sample.db` in the project root with sampled data from the remote database.

## Code Conventions

### TypeScript Style

- **Strict Mode**: All strict TypeScript checks enabled
- **Modern Syntax**: Uses ESNext features, async/await
- **No Explicit Types**: Relies on type inference where clear
- **Import Style**: ES modules only (`import`/`export`)

### Database Conventions

- **Table Naming**: Uses snake_case for remote tables, removes prefixes for local tables
- **Schema Modifications**: Adds `IF NOT EXISTS` to CREATE TABLE statements
- **Backticks**: Removes backticks from SQL for compatibility

### Variable Naming

- `turso`: Remote Turso database connection
- `db`: Local SQLite database connection
- Descriptive names for SQL strings: `createTableSql`, `insertSql`

## Important Considerations for AI Assistants

### 1. Runtime Environment

**CRITICAL**: This project uses **Bun**, not Node.js. Key differences:
- Use `Bun.env` for environment variables (not `process.env`)
- `bun.lockb` is the lockfile (not `package-lock.json` or `yarn.lock`)
- Run scripts with `bun run` (not `npm run` or `node`)
- Bun natively supports TypeScript (no compilation step needed)

### 2. Current State & Evolution

This is an **experimental project** transitioning toward a CLI tool:
- Code is currently procedural and top-level
- Hardcoded values exist (table names, sample sizes)
- When refactoring, preserve the core dump/restore workflow
- CLI features should be added incrementally

### 3. Database Operations

**Schema Transformations**:
- The script modifies SQL statements from remote to local
- Removes `tana_` prefix from table names
- Adds `IF NOT EXISTS` clause
- Removes backtick characters

**Connection Pattern**:
```typescript
const turso = createClient({ url, authToken }); // Remote
const db = createClient({ url: "file:./sample.db" }); // Local
```

### 4. Dependencies

**Key Libraries**:
- `@libsql/client`: Works with Turso (libSQL) and SQLite
- `drizzle-orm`: Currently used for schema exploration, could be expanded
- `papaparse`: Available but not yet utilized (likely for CSV export features)

### 5. Security & Credentials

**Important**:
- `.env` files are gitignored (DO NOT commit credentials)
- `*.db` files are gitignored (DO NOT commit sample databases)
- Auth tokens should always be loaded from environment variables
- Validate presence of `DB_URL` and `DB_TOKEN` before operations

### 6. Testing Considerations

Currently no test framework is configured. When adding tests:
- Bun has built-in test runner (`bun test`)
- Use `file::memory:` for test databases (don't create actual files)
- Mock environment variables for tests

### 7. Error Handling

Current implementation has minimal error handling. When improving:
- Add validation for environment variables
- Handle database connection failures gracefully
- Check if tables exist before operations
- Validate query results before processing

### 8. Future CLI Development

When evolving to a CLI tool, consider:
- Use a CLI framework (Commander.js, Yargs, or Bun's built-in argv)
- Support multiple tables (not just `tana_links`)
- Add flags for sample size, output format, etc.
- Implement restore/import functionality
- Add progress indicators for large datasets
- Support CSV, JSON output formats (PapaParse is already available)

## Common Development Tasks

### Adding a New Feature

1. Read existing code to understand patterns
2. Maintain Bun-specific APIs (`Bun.env`, etc.)
3. Test with actual Turso database connection
4. Update this CLAUDE.md if adding new conventions

### Refactoring

**Priority Order**:
1. Keep the script functional - test after each change
2. Extract hardcoded values to constants/config
3. Convert to functions (keep modular)
4. Add error handling
5. Add CLI interface

**Don't Over-Engineer**:
- Keep it simple - this is a utility tool
- Avoid unnecessary abstractions early
- Prioritize working code over perfect architecture

### Debugging

```bash
# Bun supports console.log debugging
bun run index.ts

# Check generated database
sqlite3 sample.db "SELECT count(*) FROM links;"

# Verify environment variables
bun -e "console.log(Bun.env.DB_URL)"
```

## Git Workflow

**Branch Naming**: Use `claude/` prefix for AI-generated branches
**Commit Messages**: Clear, descriptive commits that explain the "why"
**Before Committing**:
- Ensure no credentials in code
- Verify `.db` files not staged
- Test the script runs successfully

## Questions to Ask Before Making Changes

1. Does this change maintain compatibility with Bun?
2. Are environment variables still the source of truth for credentials?
3. Will this work with the current Turso/libSQL setup?
4. Does this move toward CLI functionality without breaking current behavior?
5. Have I tested with an actual database connection?

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Turso Documentation](https://docs.turso.tech/)
- [libSQL Documentation](https://github.com/tursodatabase/libsql)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

---

**Last Updated**: 2026-01-09
**Document Version**: 1.0.0
