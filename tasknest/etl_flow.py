
import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
from prefect import flow
from prefect import flow
from prefect.server.schemas.schedules import CronSchedule

# Load environment variables
load_dotenv()

# Source DB connection
SOURCE_DB_URI = os.getenv("POSTGRESQL_URI")
source_engine = create_engine(SOURCE_DB_URI)

# Target DB connection (set this in your .env as TARGET_DB_URI)
TARGET_DB_URI = os.getenv("TARGET_DB_URI")
target_engine = create_engine(TARGET_DB_URI)

@flow
def run_etl():
    # Extract users and todos
    users_df = pd.read_sql("SELECT * FROM users", source_engine)
    todos_df = pd.read_sql("SELECT * FROM todos", source_engine)

    # Transform: join on user_id
    joined_df = todos_df.merge(users_df, left_on="user_id", right_on="id", suffixes=("_todo", "_user"))

    # Optional: clean/transform data here
    # Example: drop columns you don't want
    # joined_df = joined_df.drop(["password"], axis=1)

    # Load: write to target DB
    joined_df.to_sql("user_todos_joined", target_engine, if_exists="replace", index=False)

    print("ETL complete: joined data loaded to target DB table 'user_todos_joined'.")

if __name__ == "__main__":
    run_etl()