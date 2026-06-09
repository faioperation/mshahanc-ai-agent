from typing import Any, Dict, List, Optional
from app.airtable.client import get_table
from app.airtable.tables import TABLES


def get_events_table():
    return get_table(TABLES["events"])


def create_event(data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_events_table()
    record = table.create(data)
    return {"id": record["id"], **record["fields"]}


def get_event_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    table = get_events_table()
    record = table.get(record_id)
    if not record:
        return None
    return {"id": record["id"], **record["fields"]}


def get_events_by_lead(lead_id: str) -> List[Dict[str, Any]]:
    table = get_events_table()
    formula = f"{{lead_id}} = '{lead_id}'"
    records = table.all(formula=formula)
    return [{"id": r["id"], **r["fields"]} for r in records]


def get_scheduled_events() -> List[Dict[str, Any]]:
    table = get_events_table()
    formula = "{status} = 'scheduled'"
    records = table.all(formula=formula)
    return [{"id": r["id"], **r["fields"]} for r in records]


def get_all_events(status: Optional[str] = None) -> List[Dict[str, Any]]:
    table = get_events_table()
    if status:
        formula = f"{{status}} = '{status}'"
        records = table.all(formula=formula)
    else:
        records = table.all()
    return [{"id": r["id"], **r["fields"]} for r in records]


def update_event(record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    table = get_events_table()
    record = table.update(record_id, data)
    return {"id": record["id"], **record["fields"]}


def cancel_events_by_lead(lead_id: str):
    table = get_events_table()
    formula = f"AND({{lead_id}} = '{lead_id}', {{status}} = 'scheduled')"
    records = table.all(formula=formula)
    for record in records:
        table.update(record["id"], {"status": "cancelled"})