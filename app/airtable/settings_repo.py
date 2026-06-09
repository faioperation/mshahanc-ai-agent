from typing import Any, Dict, Optional
from datetime import datetime, timezone
from app.airtable.client import get_table
from app.airtable.tables import TABLES


def get_settings_table():
    return get_table(TABLES["settings"])


def get_setting(key: str) -> Optional[str]:
    table = get_settings_table()
    formula = f"{{key}} = '{key}'"
    records = table.all(formula=formula)
    if not records:
        return None
    return records[0]["fields"].get("value")


def set_setting(key: str, value: str) -> Dict[str, Any]:
    table = get_settings_table()
    formula = f"{{key}} = '{key}'"
    records = table.all(formula=formula)
    data = {
        "key": key,
        "value": value,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if records:
        record = table.update(records[0]["id"], data)
    else:
        record = table.create(data)
    return {"id": record["id"], **record["fields"]}


def get_all_settings() -> Dict[str, str]:
    table = get_settings_table()
    records = table.all()
    return {r["fields"]["key"]: r["fields"].get("value") for r in records}