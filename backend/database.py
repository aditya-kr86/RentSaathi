from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os

def _resolve_database_url() -> str:
    # Highest priority: explicit database URL.
    direct_url = os.getenv("DATABASE_URL")
    if direct_url:
        return direct_url

    # Supabase split credentials support:
    # - SUPABASE_DB_URI should include a password placeholder (`<PASSWORD>` or `{password}`),
    #   or can be a full PostgreSQL URI by itself.
    supabase_uri = os.getenv("SUPABASE_DB_URI")
    supabase_password = os.getenv("SUPABASE_DB_PASSWORD")
    if supabase_uri:
        if supabase_password:
            return (
                supabase_uri
                .replace("<PASSWORD>", supabase_password)
                .replace("{password}", supabase_password)
            )
        return supabase_uri

    # Local fallback for development.
    return "sqlite:///./rentsaathi.db"


DATABASE_URL = _resolve_database_url()

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class WaitlistEmail(Base):
    """Model for storing waitlist emails"""
    __tablename__ = "waitlist_emails"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<WaitlistEmail(id={self.id}, email={self.email})>"


class User(Base):
    """Model for storing registered users"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    is_premium = Column(Boolean, default=False, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Profile(Base):
    """Model for storing a user's profile wizard responses"""
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(50), nullable=False)
    location = Column(String(255), nullable=False)
    budget_min = Column(Integer, nullable=False)
    budget_max = Column(Integer, nullable=False)
    smoking = Column(String(50), nullable=True)
    alcohol = Column(String(50), nullable=True)
    food_preference = Column(String(50), nullable=True)
    cooking = Column(String(50), nullable=True)
    cleanliness_level = Column(String(50), nullable=True)
    sleep_schedule = Column(String(50), nullable=True)
    employment_status = Column(String(50), nullable=True)
    work_type = Column(String(50), nullable=True)
    working_hours = Column(String(50), nullable=True)
    preferred_gender = Column(String(50), nullable=True)
    preferred_occupation = Column(String(50), nullable=True)
    guests_allowed = Column(String(50), nullable=True)
    noise_tolerance = Column(String(50), nullable=True)
    dietary_restrictions = Column(String(255), nullable=True)
    personal_habits = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<Profile(user_id={self.user_id}, full_name={self.full_name})>"


class Listing(Base):
    """Model for storing user-owned flat listings"""
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    location = Column(String(255), index=True, nullable=False)
    rent = Column(Integer, index=True, nullable=False)
    availability = Column(String(100), nullable=True)
    description = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Listing(id={self.id}, owner_id={self.owner_id}, location={self.location})>"


class ListingImage(Base):
    """Model for storing listing image URLs"""
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), index=True, nullable=False)
    image_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    listing = relationship("Listing", back_populates="images")

    def __repr__(self):
        return f"<ListingImage(id={self.id}, listing_id={self.listing_id})>"


# Create all tables
Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
