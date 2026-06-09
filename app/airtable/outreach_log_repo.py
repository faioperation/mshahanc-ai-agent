from typing import Any, Dict, List
from datetime import datetime, timezone
from app.airtable.client import get_table
from app.airtable.tables import TABLES


def get_outreach_logs_table():
    return get_table(TABLES["outreach_logs"])


def create_log(data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_outreach_logs_table()
    data["sent_at"] = datetime.now(timezone.utc).isoformat()
    record = table.create(data)
    return {"id": record["id"], **record["fields"]}


def get_logs_by_lead(lead_id: str) -> List[Dict[str, Any]]:
    table = get_outreach_logs_table()
    formula = f"{{lead_id}} = '{lead_id}'"
    records = table.all(formula=formula)
    return [{"id": r["id"], **r["fields"]} for r in records]


def get_all_logs() -> List[Dict[str, Any]]:
    table = get_outreach_logs_table()
    records = table.all()
    return [{"id": r["id"], **r["fields"]} for r in records]