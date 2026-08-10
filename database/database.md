# PostgreSQL + Prisma

## Overview

Learn how to build reliable data-driven applications using **PostgreSQL** and **Prisma ORM**. Prisma makes database design visible in code through schemas, migrations, and type-safe queries.

## Key Concepts

* **Models & Fields** — Define database tables and their data.
* **IDs & Constraints** — Maintain stable identity and data integrity.
* **Relations** — Connect users, projects, tasks, and comments.
* **Migrations** — Track and safely apply database changes.
* **Prisma Client** — Write type-safe database queries with TypeScript.
* **Indexes** — Improve performance for frequent searches and joins.
* **Transactions** — Ensure multiple operations succeed or fail together.

## Development Workflow

1. Sketch the data model and relationships.
2. Create the Prisma schema.
3. Generate and inspect migrations.
4. Seed the database with sample data.
5. Query data using Prisma Client.

## Practice Project

Build a **Project Tracker** with:

* Users & ownership
* Projects & tasks
* Comments
* Task status
* Created/updated timestamps
* Proper relations and constraints

Practice queries such as:

* Tasks assigned to the current user
* Project with its tasks and comments

## Common Mistakes

* Making every field optional.
* Forgetting unique constraints.
* Changing production schema without migrations.
* Fetching unnecessary nested data.
* Ignoring indexes for frequent queries.

## Resources

* Prisma Documentation
* Prisma + Next.js Guide
* PostgreSQL Tutorial
* Prisma YouTube Channel

