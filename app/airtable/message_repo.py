from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from app.airtable.client import get_table
from app.airtable.tables import TABLES


def get_messages_table():
    return get_table(TABLES["messages"])


def create_message(data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_messages_table()
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    record = table.create(data)
    return {"id": record["id"], **record["fields"]}


def get_message_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    table = get_messages_table()
    record = table.get(record_id)
    if not record:
        return None
    return {"id": record["id"], **record["fields"]}


def get_messages_by_lead(lead_id: str) -> List[Dict[str, Any]]:
    table = get_messages_table()
    formula = f"{{lead_id}} = '{lead_id}'"
    records = table.all(formula=formula)
    return [{"id": r["id"], **r["fields"]} for r in records]


def get_pending_review_messages() -> List[Dict[str, Any]]:
    table = get_messages_table()
    formula = "{status} = 'pending_review'"
    records = table.all(formula=formula)
    return [{"id": r["id"], **r["fields"]} for r in records]


def update_message(record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_messages_table()
    record = table.update(record_id, data)
    return {"id": record["id"], **record["fields"]}