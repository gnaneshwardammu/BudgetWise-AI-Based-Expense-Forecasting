import sqlite3, os

db_path = os.path.join("instance", "database.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

cols = [row[1] for row in c.execute("PRAGMA table_info(users)").fetchall()]
print("Existing columns:", cols)

if "is_admin" not in cols:
    c.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0")
    print("Column is_admin added.")
else:
    print("Column is_admin already exists.")

admin_email = "gnaneshwar@gamil.com"
c.execute("UPDATE users SET is_admin = 1 WHERE email = ?", (admin_email,))
print(f"Rows updated for {admin_email}:", c.rowcount)

conn.commit()
conn.close()
print("Migration complete.")
