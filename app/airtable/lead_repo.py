from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from app.airtable.client import get_table
from app.airtable.tables import TABLES


def get_leads_table():
    return get_table(TABLES["leads"])


def create_lead(data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_leads_table()
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    record = table.create(data)
    return {"id": record["id"], **record["fields"]}


def get_lead_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    table = get_leads_table()
    record = table.get(record_id)
    if not record:
        return None
    return {"id": record["id"], **record["fields"]}


def get_all_leads(status: Optional[str] = None) -> List[Dict[str, Any]]:
    table = get_leads_table()
    if status:
        formula = f"{{status}} = '{status}'"
        records = table.all(formula=formula)
    else:
        records = table.all()
    return [{"id": r["id"], **r["fields"]} for r in records]


def update_lead(record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_leads_table()
    record = table.update(record_id, data)
    return {"id": record["id"], **record["fields"]}


def find_duplicate_lead(email: str = None, phone: str = None) -> Optional[Dict[str, Any]]:
    table = get_leads_table()
    if email:
        formula = f"{{email}} = '{email}'"
        records = table.all(formula=formula)
        if records:
            return {"id": records[0]["id"], **records[0]["fields"]}
    if phone:
        formula = f"{{phone}} = '{phone}'"
        records = table.all(formula=formula)
        if records:
            return {"id": records[0]["id"], **records[0]["fields"]}
    return None