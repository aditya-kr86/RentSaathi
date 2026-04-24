import os

from database import Profile


MATCH_SCORING_CONFIG = {
    "budget_mismatch_penalty": int(os.getenv("MATCH_BUDGET_MISMATCH_PENALTY", "30")),
    "smoking_mismatch_penalty": int(os.getenv("MATCH_SMOKING_MISMATCH_PENALTY", "20")),
    "lifestyle_similarity_bonus": int(os.getenv("MATCH_LIFESTYLE_SIMILARITY_BONUS", "40")),
    "lifestyle_fields": [
        "cleanliness_level",
        "sleep_schedule",
        "food_preference",
        "cooking",
        "alcohol",
        "guests_allowed",
        "noise_tolerance",
    ],
}


def _normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def _is_budget_mismatch(user_a: Profile, user_b: Profile) -> bool:
    # Budgets are compatible only if their acceptable ranges overlap.
    return user_a.budget_max < user_b.budget_min or user_b.budget_max < user_a.budget_min


def _is_smoking_mismatch(user_a: Profile, user_b: Profile) -> bool:
    smoking_a = _normalize_text(user_a.smoking)
    smoking_b = _normalize_text(user_b.smoking)
    if not smoking_a or not smoking_b:
        return False
    return smoking_a != smoking_b


def _lifestyle_similarity_ratio(user_a: Profile, user_b: Profile) -> float:
    matches = 0
    compared = 0

    for field in MATCH_SCORING_CONFIG["lifestyle_fields"]:
        value_a = _normalize_text(getattr(user_a, field, None))
        value_b = _normalize_text(getattr(user_b, field, None))

        if not value_a or not value_b:
            continue

        compared += 1
        if value_a == value_b:
            matches += 1

    if compared == 0:
        return 0.0

    return matches / compared


def match_score(user_a: Profile, user_b: Profile) -> int:
    """Calculate normalized 0-100 roommate compatibility score."""
    raw_score = 0.0

    if _is_budget_mismatch(user_a, user_b):
        raw_score -= MATCH_SCORING_CONFIG["budget_mismatch_penalty"]

    if _is_smoking_mismatch(user_a, user_b):
        raw_score -= MATCH_SCORING_CONFIG["smoking_mismatch_penalty"]

    raw_score += (
        _lifestyle_similarity_ratio(user_a, user_b)
        * MATCH_SCORING_CONFIG["lifestyle_similarity_bonus"]
    )

    min_raw_score = -(
        MATCH_SCORING_CONFIG["budget_mismatch_penalty"]
        + MATCH_SCORING_CONFIG["smoking_mismatch_penalty"]
    )
    max_raw_score = MATCH_SCORING_CONFIG["lifestyle_similarity_bonus"]

    normalized_score = ((raw_score - min_raw_score) / (max_raw_score - min_raw_score)) * 100
    return max(0, min(100, int(round(normalized_score))))