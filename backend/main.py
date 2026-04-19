from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import os
from dotenv import load_dotenv

from database import get_db, WaitlistEmail
from schemas import WaitlistEmailCreate, WaitlistEmailResponse

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="RentPartner API",
    description="Smart flatmate matching platform API",
    version="0.1.0"
)

# CORS Configuration - Allow frontend to communicate
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


# Waitlist endpoints
async def _create_waitlist_entry(request: WaitlistEmailCreate, db: Session) -> WaitlistEmail:
    """
    Join the waitlist with email.

    Returns:
        WaitlistEmailResponse: Email and creation timestamp

    Raises:
        HTTPException: If email already exists or invalid
    """
    try:
        existing = db.query(WaitlistEmail).filter(WaitlistEmail.email == request.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered on waitlist"
            )

        db_email = WaitlistEmail(email=request.email)
        db.add(db_email)
        db.commit()
        db.refresh(db_email)
        return db_email

    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered on waitlist"
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to join waitlist right now"
        )


@app.post("/api/waitlist", response_model=WaitlistEmailResponse, tags=["Waitlist"])
async def join_waitlist(
    request: WaitlistEmailCreate,
    db: Session = Depends(get_db)
):
    return await _create_waitlist_entry(request, db)


@app.post("/waitlist", response_model=WaitlistEmailResponse, tags=["Waitlist"])
async def join_waitlist_alias(
    request: WaitlistEmailCreate,
    db: Session = Depends(get_db)
):
    return await _create_waitlist_entry(request, db)


@app.get("/api/waitlist/count", tags=["Waitlist"])
async def waitlist_count(db: Session = Depends(get_db)):
    """Get total number of emails in waitlist"""
    count = db.query(WaitlistEmail).count()
    return {"count": count}


@app.get("/api/waitlist", response_model=list[WaitlistEmailResponse], tags=["Waitlist"])
async def get_waitlist(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all waitlist emails (paginated) - For admin use"""
    emails = db.query(WaitlistEmail).offset(skip).limit(limit).all()
    return emails


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to RentPartner API",
        "version": "0.1.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
