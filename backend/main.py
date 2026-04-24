from collections import deque
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import Lock
from time import time
from uuid import uuid4

from fastapi import FastAPI, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import os
from dotenv import load_dotenv

from schemas import (
    AdminUserSummary,
    AuthResponse,
    ListingCreate,
    ListingImageResponse,
    MatchResponse,
    MatchUserSummary,
    ListingUpdate,
    ListingResponse,
    ProfileResponse,
    ProfileUpsertRequest,
    TokenPairResponse,
    TokenRefreshRequest,
    UserCreate,
    UserLogin,
    UserResponse,
    WaitlistEmailCreate,
    WaitlistEmailResponse,
)
from database import Listing, ListingImage, Profile, SessionLocal, User, WaitlistEmail, get_db
from matching import match_score

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="RentPartner API",
    description="Smart flatmate matching platform API",
    version="0.1.0"
)

UPLOADS_ROOT = Path(__file__).resolve().parent / "uploads"
LISTING_UPLOADS_DIR = UPLOADS_ROOT / "listings"
LISTING_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_ROOT)), name="uploads")

WAITLIST_RATE_LIMIT_MAX_REQUESTS = int(os.getenv("WAITLIST_RATE_LIMIT_MAX_REQUESTS", "5"))
WAITLIST_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("WAITLIST_RATE_LIMIT_WINDOW_SECONDS", "60"))
_waitlist_rate_limit_store: dict[str, deque[float]] = {}
_waitlist_rate_limit_lock = Lock()

LOGIN_RATE_LIMIT_MAX_REQUESTS = int(os.getenv("LOGIN_RATE_LIMIT_MAX_REQUESTS", "10"))
LOGIN_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("LOGIN_RATE_LIMIT_WINDOW_SECONDS", "60"))
_login_rate_limit_store: dict[str, deque[float]] = {}
_login_rate_limit_lock = Lock()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@ankus.dev").strip().lower()
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@123")
ADMIN_EMAILS = {
    email.strip().lower()
    for email in os.getenv("ADMIN_EMAILS", DEFAULT_ADMIN_EMAIL).split(",")
    if email.strip()
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

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


@app.on_event("startup")
async def initialize_default_admin() -> None:
    _ensure_default_admin_user()


def _get_client_identifier(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Use the first entry when request passed through one or more proxies.
        return forwarded_for.split(",", 1)[0].strip()

    if request.client and request.client.host:
        return request.client.host

    return "unknown-client"


def _is_rate_limited(
    client_identifier: str,
    store: dict[str, deque[float]],
    lock: Lock,
    max_requests: int,
    window_seconds: int,
) -> bool:
    now = time()

    with lock:
        request_times = store.setdefault(client_identifier, deque())
        cutoff = now - window_seconds

        while request_times and request_times[0] <= cutoff:
            request_times.popleft()

        if len(request_times) >= max_requests:
            return True

        request_times.append(now)
        return False


def reset_waitlist_rate_limit_state() -> None:
    with _waitlist_rate_limit_lock:
        _waitlist_rate_limit_store.clear()


def configure_waitlist_rate_limit(max_requests: int, window_seconds: int) -> None:
    global WAITLIST_RATE_LIMIT_MAX_REQUESTS
    global WAITLIST_RATE_LIMIT_WINDOW_SECONDS

    WAITLIST_RATE_LIMIT_MAX_REQUESTS = max_requests
    WAITLIST_RATE_LIMIT_WINDOW_SECONDS = window_seconds
    reset_waitlist_rate_limit_state()


async def enforce_waitlist_rate_limit(request: Request) -> None:
    client_identifier = _get_client_identifier(request)
    if _is_rate_limited(
        client_identifier,
        _waitlist_rate_limit_store,
        _waitlist_rate_limit_lock,
        WAITLIST_RATE_LIMIT_MAX_REQUESTS,
        WAITLIST_RATE_LIMIT_WINDOW_SECONDS,
    ):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many waitlist requests. Please try again shortly.",
        )


def reset_login_rate_limit_state() -> None:
    with _login_rate_limit_lock:
        _login_rate_limit_store.clear()


def configure_login_rate_limit(max_requests: int, window_seconds: int) -> None:
    global LOGIN_RATE_LIMIT_MAX_REQUESTS
    global LOGIN_RATE_LIMIT_WINDOW_SECONDS

    LOGIN_RATE_LIMIT_MAX_REQUESTS = max_requests
    LOGIN_RATE_LIMIT_WINDOW_SECONDS = window_seconds
    reset_login_rate_limit_state()


async def enforce_login_rate_limit(request: Request) -> None:
    client_identifier = _get_client_identifier(request)
    if _is_rate_limited(
        client_identifier,
        _login_rate_limit_store,
        _login_rate_limit_lock,
        LOGIN_RATE_LIMIT_MAX_REQUESTS,
        LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    ):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again shortly.",
        )


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def _ensure_default_admin_user() -> None:
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.email == DEFAULT_ADMIN_EMAIL).first()
        if existing_admin is not None:
            return

        admin_user = User(
            email=DEFAULT_ADMIN_EMAIL,
            password_hash=_hash_password(DEFAULT_ADMIN_PASSWORD),
            is_premium=True,
        )
        db.add(admin_user)
        db.commit()
    finally:
        db.close()


def _create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    payload = {
        "sub": subject,
        "type": token_type,
        "exp": datetime.now(timezone.utc) + expires_delta,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _create_access_token(subject: str) -> str:
    return _create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def _create_refresh_token(subject: str) -> str:
    return _create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS),
    )


def _decode_token(token: str, expected_token_type: str) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        if email is None or token_type != expected_token_type:
            raise credentials_exception
        return email
    except JWTError as exc:
        raise credentials_exception from exc


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
        is_premium=user.is_premium,
        is_admin=user.email.lower() in ADMIN_EMAILS,
    )

def _to_profile_response(profile: Profile) -> ProfileResponse:
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.full_name,
        age=profile.age,
        gender=profile.gender,
        location=profile.location,
        budget_min=profile.budget_min,
        budget_max=profile.budget_max,
        smoking=profile.smoking,
        alcohol=profile.alcohol,
        food_preference=profile.food_preference,
        cooking=profile.cooking,
        cleanliness_level=profile.cleanliness_level,
        sleep_schedule=profile.sleep_schedule,
        employment_status=profile.employment_status,
        work_type=profile.work_type,
        working_hours=profile.working_hours,
        preferred_gender=profile.preferred_gender,
        preferred_occupation=profile.preferred_occupation,
        guests_allowed=profile.guests_allowed,
        noise_tolerance=profile.noise_tolerance,
        dietary_restrictions=profile.dietary_restrictions,
        personal_habits=profile.personal_habits,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


def _to_listing_response(listing: Listing) -> ListingResponse:
    return ListingResponse(
        id=listing.id,
        owner_id=listing.owner_id,
        title=listing.title,
        location=listing.location,
        rent=listing.rent,
        availability=listing.availability,
        description=listing.description,
        images=[
            ListingImageResponse(id=image.id, image_url=image.image_url)
            for image in listing.images
        ],
        image_urls=[image.image_url for image in listing.images],
        created_at=listing.created_at,
        updated_at=listing.updated_at,
    )


def _get_owner_listing(db: Session, listing_id: int, owner_id: int) -> Listing:
    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id, Listing.owner_id == owner_id)
        .first()
    )
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    return listing


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    email = _decode_token(token, expected_token_type="access")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.email.lower() not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


def _delete_listing_files(listing: Listing) -> None:
    for image in listing.images:
        absolute_path = UPLOADS_ROOT / image.image_url.replace("/uploads/", "")
        if absolute_path.exists() and absolute_path.is_file():
            absolute_path.unlink(missing_ok=True)


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
    _: None = Depends(enforce_waitlist_rate_limit),
    db: Session = Depends(get_db)
):
    return await _create_waitlist_entry(request, db)


@app.post("/waitlist", response_model=WaitlistEmailResponse, tags=["Waitlist"])
async def join_waitlist_alias(
    request: WaitlistEmailCreate,
    _: None = Depends(enforce_waitlist_rate_limit),
    db: Session = Depends(get_db)
):
    return await _create_waitlist_entry(request, db)


@app.post("/auth/register", response_model=AuthResponse, tags=["Auth"])
async def register_user(request: UserCreate, db: Session = Depends(get_db)):
    clean_email = request.email.lower().strip()

    try:
        existing = db.query(User).filter(User.email == clean_email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

        db_user = User(
            email=clean_email,
            password_hash=_hash_password(request.password),
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        access_token = _create_access_token(subject=db_user.email)
        refresh_token = _create_refresh_token(subject=db_user.email)
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=_to_user_response(db_user),
        )

    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register right now",
        )


@app.post("/auth/login", response_model=AuthResponse, tags=["Auth"])
async def login_user(
    request: UserLogin,
    _: None = Depends(enforce_login_rate_limit),
    db: Session = Depends(get_db),
):
    clean_email = request.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()

    if user is None or not _verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = _create_access_token(subject=user.email)
    refresh_token = _create_refresh_token(subject=user.email)
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=_to_user_response(user),
    )


@app.post("/auth/refresh", response_model=TokenPairResponse, tags=["Auth"])
async def refresh_access_token(request: TokenRefreshRequest):
    email = _decode_token(request.refresh_token, expected_token_type="refresh")
    return TokenPairResponse(
        access_token=_create_access_token(subject=email),
        refresh_token=_create_refresh_token(subject=email),
        token_type="bearer",
    )


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
async def get_me(current_user: User = Depends(get_current_user)):
    return _to_user_response(current_user)


@app.get("/profile/me", response_model=ProfileResponse, tags=["Profile"])
async def get_profile_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return _to_profile_response(profile)


@app.post("/profile", response_model=ProfileResponse, tags=["Profile"])
async def upsert_profile(
    request: ProfileUpsertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile_data = request.model_dump()

    if profile is None:
        profile = Profile(user_id=current_user.id, **profile_data)
        db.add(profile)
    else:
        for field_name, field_value in profile_data.items():
            setattr(profile, field_name, field_value)

    db.commit()
    db.refresh(profile)
    return _to_profile_response(profile)


@app.post("/listings", response_model=ListingResponse, tags=["Listings"])
async def create_listing(
    title: str = Form(...),
    location: str = Form(...),
    rent: int = Form(...),
    availability: str | None = Form(default=None),
    description: str | None = Form(default=None),
    images: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(images) < 3 or len(images) > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attach between 3 and 6 images.",
        )

    clean_title = title.strip()
    clean_location = location.strip()
    if len(clean_title) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be at least 3 characters.",
        )
    if len(clean_location) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location must be at least 2 characters.",
        )
    if rent <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rent must be a positive number.",
        )

    listing = Listing(
        owner_id=current_user.id,
        title=clean_title,
        location=clean_location,
        rent=rent,
        availability=availability.strip() if isinstance(availability, str) else None,
        description=description.strip() if isinstance(description, str) else None,
    )

    for image in images:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed.",
            )

        file_suffix = Path(image.filename or "").suffix.lower() or ".jpg"
        safe_name = f"{uuid4().hex}{file_suffix}"
        destination = LISTING_UPLOADS_DIR / safe_name
        file_bytes = await image.read()

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One of the uploaded images is empty.",
            )

        destination.write_bytes(file_bytes)
        listing.images.append(ListingImage(image_url=f"/uploads/listings/{safe_name}"))

    db.add(listing)
    db.commit()
    db.refresh(listing)
    return _to_listing_response(listing)


@app.get("/listings/me", response_model=list[ListingResponse], tags=["Listings"])
async def get_my_listings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    listings = (
        db.query(Listing)
        .filter(Listing.owner_id == current_user.id)
        .order_by(Listing.created_at.desc())
        .all()
    )
    return [_to_listing_response(listing) for listing in listings]


@app.get("/listings", response_model=list[ListingResponse], tags=["Listings"])
async def search_listings(
    location: str | None = Query(default=None, min_length=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Listing)

    if isinstance(location, str) and location.strip():
        location_filter = f"%{location.strip()}%"
        query = query.filter(Listing.location.ilike(location_filter))

    listings = query.order_by(Listing.created_at.desc()).limit(limit).all()
    return [_to_listing_response(listing) for listing in listings]


@app.get("/matches", response_model=list[MatchResponse], tags=["Matches"])
async def get_matches(
    limit: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if current_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complete your profile before viewing matches.",
        )

    candidate_profiles = (
        db.query(Profile)
        .filter(Profile.user_id != current_user.id)
        .all()
    )

    matches = [
        MatchResponse(
            match_score=match_score(current_profile, candidate),
            user=MatchUserSummary(
                user_id=candidate.user_id,
                full_name=candidate.full_name,
                age=candidate.age,
                gender=candidate.gender,
                location=candidate.location,
                budget_min=candidate.budget_min,
                budget_max=candidate.budget_max,
                smoking=candidate.smoking,
            ),
        )
        for candidate in candidate_profiles
    ]

    matches.sort(key=lambda item: item.match_score, reverse=True)
    return matches[:limit]


@app.put("/listings/{listing_id}", response_model=ListingResponse, tags=["Listings"])
async def update_listing(
    listing_id: int,
    request: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = _get_owner_listing(db, listing_id=listing_id, owner_id=current_user.id)

    listing.title = request.title.strip()
    listing.location = request.location.strip()
    listing.rent = request.rent
    listing.availability = request.availability.strip() if isinstance(request.availability, str) else None
    listing.description = request.description.strip() if isinstance(request.description, str) else None
    db.commit()
    db.refresh(listing)
    return _to_listing_response(listing)


@app.delete("/listings/{listing_id}", tags=["Listings"])
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = _get_owner_listing(db, listing_id=listing_id, owner_id=current_user.id)

    _delete_listing_files(listing)

    db.delete(listing)
    db.commit()
    return {"detail": "Listing deleted successfully."}


@app.get("/admin/listings", response_model=list[ListingResponse], tags=["Admin"])
async def get_all_listings_for_admin(
    limit: int = Query(default=100, ge=1, le=500),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    listings = db.query(Listing).order_by(Listing.created_at.desc()).limit(limit).all()
    return [_to_listing_response(listing) for listing in listings]


@app.get("/admin/users", response_model=list[AdminUserSummary], tags=["Admin"])
async def get_all_users_for_admin(
    limit: int = Query(default=100, ge=1, le=500),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).limit(limit).all()
    return [
        AdminUserSummary(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            is_premium=user.is_premium,
            is_admin=user.email.lower() in ADMIN_EMAILS,
            listing_count=db.query(Listing).filter(Listing.owner_id == user.id).count(),
        )
        for user in users
    ]


@app.delete("/admin/listings/{listing_id}", tags=["Admin"])
async def admin_delete_listing(
    listing_id: int,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    _delete_listing_files(listing)
    db.delete(listing)
    db.commit()
    return {"detail": "Listing removed by admin."}


@app.delete("/admin/users/{user_id}", tags=["Admin"])
async def admin_delete_user_with_listings(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot delete their own account.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    listings = db.query(Listing).filter(Listing.owner_id == user_id).all()
    for listing in listings:
        _delete_listing_files(listing)
        db.delete(listing)

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile is not None:
        db.delete(profile)

    db.delete(user)
    db.commit()
    return {"detail": "User and all associated listings removed by admin."}


@app.post("/listings/{listing_id}/images", response_model=ListingResponse, tags=["Listings"])
async def add_listing_images(
    listing_id: int,
    images: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = _get_owner_listing(db, listing_id=listing_id, owner_id=current_user.id)

    if len(images) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload at least one image.",
        )

    if len(listing.images) + len(images) > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 6 images allowed per listing.",
        )

    for image in images:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed.",
            )

        file_suffix = Path(image.filename or "").suffix.lower() or ".jpg"
        safe_name = f"{uuid4().hex}{file_suffix}"
        destination = LISTING_UPLOADS_DIR / safe_name
        file_bytes = await image.read()

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One of the uploaded images is empty.",
            )

        destination.write_bytes(file_bytes)
        listing.images.append(ListingImage(image_url=f"/uploads/listings/{safe_name}"))

    db.commit()
    db.refresh(listing)
    return _to_listing_response(listing)


@app.delete("/listings/{listing_id}/images/{image_id}", response_model=ListingResponse, tags=["Listings"])
async def delete_listing_image(
    listing_id: int,
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = _get_owner_listing(db, listing_id=listing_id, owner_id=current_user.id)
    image = next((item for item in listing.images if item.id == image_id), None)

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found for this listing.",
        )

    if len(listing.images) <= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 3 images are required per listing.",
        )

    absolute_path = UPLOADS_ROOT / image.image_url.replace("/uploads/", "")
    db.delete(image)
    db.commit()
    if absolute_path.exists() and absolute_path.is_file():
        absolute_path.unlink(missing_ok=True)

    db.refresh(listing)
    return _to_listing_response(listing)


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
