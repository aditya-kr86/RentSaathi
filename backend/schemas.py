from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class WaitlistEmailCreate(BaseModel):
    """Schema for creating a waitlist email"""
    email: EmailStr


class WaitlistEmailResponse(BaseModel):
    """Schema for waitlist email response"""
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    detail: str


class UserCreate(BaseModel):
    """Schema for registering a user"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = None


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    """Schema for user data in auth responses"""
    id: int
    email: str
    created_at: datetime
    is_premium: bool
    is_admin: bool

    class Config:
        from_attributes = True


class TokenRefreshRequest(BaseModel):
    """Schema for refreshing access token"""
    refresh_token: str


class TokenPairResponse(BaseModel):
    """Schema for access and refresh token pair"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(TokenPairResponse):
    """Schema for authentication response"""
    user: UserResponse


class ProfileUpsertRequest(BaseModel):
    """Schema for creating or updating a user profile"""
    full_name: str
    age: int
    gender: str
    location: str
    budget_min: int
    budget_max: int
    smoking: str | None = None
    alcohol: str | None = None
    food_preference: str | None = None
    cooking: str | None = None
    cleanliness_level: str | None = None
    sleep_schedule: str | None = None
    employment_status: str | None = None
    work_type: str | None = None
    working_hours: str | None = None
    preferred_gender: str | None = None
    preferred_occupation: str | None = None
    guests_allowed: str | None = None
    noise_tolerance: str | None = None
    dietary_restrictions: str | None = None
    personal_habits: str | None = None


class ProfileResponse(ProfileUpsertRequest):
    """Schema for returning a saved user profile"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ListingCreate(BaseModel):
    """Schema for creating a listing"""
    title: str = Field(min_length=3, max_length=255)
    location: str = Field(min_length=2, max_length=255)
    rent: int = Field(gt=0)
    availability: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=1000)


class ListingUpdate(BaseModel):
    """Schema for updating listing details"""
    title: str = Field(min_length=3, max_length=255)
    location: str = Field(min_length=2, max_length=255)
    rent: int = Field(gt=0)
    availability: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=1000)


class ListingImageResponse(BaseModel):
    """Schema for listing image metadata"""
    id: int
    image_url: str

    class Config:
        from_attributes = True


class ListingResponse(BaseModel):
    """Schema for returning listing data"""
    id: int
    owner_id: int
    title: str
    location: str
    rent: int
    availability: str | None
    description: str | None
    images: list[ListingImageResponse]
    image_urls: list[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MatchUserSummary(BaseModel):
    """Schema for matched user profile summary"""
    user_id: int
    full_name: str
    age: int
    gender: str
    location: str
    budget_min: int
    budget_max: int
    smoking: str | None


class MatchResponse(BaseModel):
    """Schema for a scored roommate match result"""
    match_score: int = Field(ge=0, le=100)
    user: MatchUserSummary


class AdminUserSummary(BaseModel):
    """Schema for admin user management list"""
    id: int
    email: str
    created_at: datetime
    is_premium: bool
    is_admin: bool
    listing_count: int
