Full Command List

## 1. Initialize Drizzle

Sets up Drizzle (optional but useful).

```
npx drizzle-kit init
```

## 2. Generate Migration Files

Reads your schema and builds migration SQL.

```
npx drizzle-kit generate
```

## 3. Push Migrations to Database

Applies all migrations to your PostgreSQL DB.

```
npx drizzle-kit push
```

## 4. Check Migration Status

See pending or completed migrations.

```
npx drizzle-kit status
```

## 5. Visual Database Studio (GUI)

Opens Drizzle Studio in the browser.

```
npx drizzle-kit studio
```

### Workflow Summary

After Edit schema

```sql
Run npx drizzle-kit init (if not done yet)
Run npx drizzle-kit generate
Run npx drizzle-kit push
Run npx drizzle-kit check (Check status with )
Run npx drizzle-kit studio (Optional: Open Studio with )
```

Optional: Use studio to inspect DB
