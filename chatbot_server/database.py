from pymongo import MongoClient
from dotenv import load_dotenv
import os
import sys

# Load environment variables from .env file
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
# LOCALMONGODB = os.getenv("LOCALMONGODB")


def get_database():
    try:
        client = MongoClient(MONGO_URL)
        db = client["eCommerce"]
        print("✅ MongoDB connected")
        return db
    except Exception as e:
        print("Database connection error:", str(e))
        sys.exit(1)
