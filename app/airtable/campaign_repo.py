# FILE: app/airtable/campaign_repo.py
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from app.airtable.client import get_table
from app.airtable.tables import TABLES


def get_campaigns_table():
    return get_table(TABLES["campaigns"])


def create_campaign(data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_campaigns_table()
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    record = table.create(data)
    return {"id": record["id"], **record["fields"]}


def get_campaign_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    table = get_campaigns_table()
    record = table.get(record_id)
    if not record:
        return None
    return {"id": record["id"], **record["fields"]}


def get_all_campaigns() -> List[Dict[str, Any]]:
    table = get_campaigns_table()
    records = table.all()
    return [{"id": r["id"], **r["fields"]} for r in records]


def get_due_scheduled_campaigns(now_iso: str) -> List[Dict[str, Any]]:
    """Campaigns that are still 'scheduled' and whose start_at has arrived."""
    table = get_campaigns_table()
    formula = f"AND({{status}} = 'scheduled', {{start_at}} <= '{now_iso}')"
    records = table.all(formula=formula)
    return [{"id": r["id"], **r["fields"]} for r in records]


def update_campaign(record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_campaigns_table()
    record = table.update(record_id, data)
    return {"id": record["id"], **record["fields"]}