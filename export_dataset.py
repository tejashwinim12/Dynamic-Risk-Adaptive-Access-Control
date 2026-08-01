import pandas as pd
from sqlalchemy import create_engine

# PostgreSQL connection
engine = create_engine(
    "postgresql://postgres:Draac_143#@localhost:5432/draac_db"
)

query = """
SELECT
    unknown_device,
    new_location,
    suspicious_ip,
    login_hour,
    day_of_week,
    is_suspicious
FROM login_logs;
"""

df = pd.read_sql(query, engine)

print(df)

df.to_csv("draac_dataset.csv", index=False)

print("Dataset exported successfully!")