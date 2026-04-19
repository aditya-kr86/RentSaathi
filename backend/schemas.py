from pydantic import BaseModel, EmailStr
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
