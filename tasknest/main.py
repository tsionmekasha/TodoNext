from ddls.models import Base, engine, SessionLocal, User, Todo

# Ensure tables are created (redundant if already called in models.py)
Base.metadata.create_all(engine)

# Example: get all users
def get_users():
    session = SessionLocal()
    users = session.query(User).all()
    session.close()
    return users