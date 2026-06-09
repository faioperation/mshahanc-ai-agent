from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from app.airtable.client import get_table
from app.airtable.tables import TABLES


def get_replies_table():
    return get_table(TABLES["replies"])


def create_reply(data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_replies_table()
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    record = table.create(data)
    return {"id": record["id"], **record["fields"]}


def get_replies_by_lead(lead_id: str) -> List[Dict[str, Any]]:
    table = get_replies_table()
    formula = f"{{lead_id}} = '{lead_id}'"
    records = table.all(formula=formula)
    return [{"id": r["id"], **r["fields"]} for r in records]


def has_replied(lead_id: str) -> bool:
    replies = get_replies_by_lead(lead_id)
    return len(replies) > 0