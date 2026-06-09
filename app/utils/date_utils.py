from datetime import datetime, timedelta, timezone
from typing import List, Dict


SEQUENCE_DAYS = [0, 3, 7, 14]


def get_sequence_dates(start_date: datetime) -> List[Dict]:
    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)

    sequence = []
    for day in SEQUENCE_DAYS:
        scheduled_at = start_date + timedelta(days=day)
        sequence.append({
            "sequence_day": day,
            "scheduled_at": scheduled_at.isoformat(),
        })

    return sequence


def is_past_due(scheduled_at: str) -> bool:
    scheduled = datetime.fromisoformat(scheduled_at)
    if scheduled.tzinfo is None:
        scheduled = scheduled.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) >= scheduled


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def days_since(date_str: str) -> int:
    date = datetime.fromisoformat(date_str)
    if date.tzinfo is None:
        date = date.replace(tzinfo=timezone.utc)
    delta = datetime.now(timezone.utc) - date
    return delta.days