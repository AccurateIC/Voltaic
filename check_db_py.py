import psycopg2
from psycopg2.extras import RealDictCursor

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="postgres",
        database="neurogen"
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT timestamp, property_value, is_anomaly FROM archives ORDER BY created_at DESC LIMIT 5;")
    rows = cur.fetchall()
    for row in rows:
        print(row)
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
