# FILE: app/airtable/tables.py  (REPLACE existing)
from pyairtable import Api
from app.config import settings

TABLES = {
    "leads": "Leads",
    "messages": "Messages",
    "events": "Events",
    "outreach_logs": "Outreach Logs",
    "replies": "Replies",
    "settings": "Settings",
    "campaigns": "Campaigns",
}


def ensure_tables_exist():

    client = Api(settings.AIRTABLE_TOKEN)
    base = client.base(settings.AIRTABLE_BASE_ID)

    existing_tables = base.tables()
    existing_names = [t.name for t in existing_tables]

    table_schemas = {
        "Leads": [
            {"name": "business_name", "type": "singleLineText"},
            {"name": "phone", "type": "singleLineText"},
            {"name": "email", "type": "email"},
            {"name": "website", "type": "url"},
            {"name": "address", "type": "singleLineText"},
            {"name": "category", "type": "singleLineText"},
            {"name": "google_maps_url", "type": "url"},
            {"name": "source", "type": "singleLineText"},
            {"name": "lat", "type": "number", "options": {"precision": 8}},
            {"name": "lng", "type": "number", "options": {"precision": 8}},
            {"name": "status", "type": "singleLineText"},
            {"name": "disqualified_reason", "type": "singleLineText"},
            {"name": "notes", "type": "multilineText"},
            {"name": "created_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
        ],
        "Messages": [
            {"name": "lead_id", "type": "singleLineText"},
            {"name": "lead_name", "type": "singleLineText"},
            {"name": "email_subject", "type": "singleLineText"},
            {"name": "email_body", "type": "multilineText"},
            {"name": "sms_body", "type": "multilineText"},
            {"name": "status", "type": "singleLineText"},
            {"name": "sequence_day", "type": "number", "options": {"precision": 0}},
            {"name": "created_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
            {"name": "approved_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
        ],
        "Events": [
            {"name": "lead_id", "type": "singleLineText"},
            {"name": "lead_name", "type": "singleLineText"},
            {"name": "message_id", "type": "singleLineText"},
            {"name": "channel", "type": "singleLineText"},
            {"name": "sequence_day", "type": "number", "options": {"precision": 0}},
            {"name": "status", "type": "singleLineText"},
            {"name": "campaign_id", "type": "singleLineText"},
            {"name": "scheduled_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
            {"name": "sent_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
        ],
        "Outreach Logs": [
            {"name": "lead_id", "type": "singleLineText"},
            {"name": "lead_name", "type": "singleLineText"},
            {"name": "event_id", "type": "singleLineText"},
            {"name": "channel", "type": "singleLineText"},
            {"name": "message_content", "type": "multilineText"},
            {"name": "delivery_status", "type": "singleLineText"},
            {"name": "sequence_day", "type": "number", "options": {"precision": 0}},
            {"name": "sent_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
        ],
        "Replies": [
            {"name": "lead_id", "type": "singleLineText"},
            {"name": "lead_name", "type": "singleLineText"},
            {"name": "channel", "type": "singleLineText"},
            {"name": "reply_message", "type": "multilineText"},
            {"name": "sentiment", "type": "singleLineText"},
            {"name": "is_positive", "type": "checkbox", "options": {"icon": "check", "color": "greenBright"}},
            {"name": "requires_human_review", "type": "checkbox", "options": {"icon": "check", "color": "yellowBright"}},
            {"name": "created_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
                }},
        ],
        "Settings": [
            {"name": "key", "type": "singleLineText"},
            {"name": "value", "type": "multilineText"},
            {"name": "updated_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
        ],
        "Campaigns": [
            {"name": "event_name", "type": "singleLineText"},
            {"name": "event_city", "type": "singleLineText"},
            {"name": "event_date", "type": "singleLineText"},
            {"name": "event_description", "type": "multilineText"},
            {"name": "is_big_event", "type": "checkbox", "options": {"icon": "check", "color": "redBright"}},
            {"name": "status", "type": "singleLineText"},
            {"name": "total_leads", "type": "number", "options": {"precision": 0}},
            {"name": "processed_leads", "type": "number", "options": {"precision": 0}},
            {"name": "start_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
            {"name": "started_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
            {"name": "created_at", "type": "dateTime", "options": {
                "timeZone": "utc",
                "dateFormat": {"name": "iso"},
                "timeFormat": {"name": "24hour"}
            }},
        ],
    }

    for table_name, fields in table_schemas.items():
        if table_name not in existing_names:
            base.create_table(table_name, fields)
            print(f"[Airtable] Table created: {table_name}")
        else:
            print(f"[Airtable] Table already exists: {table_name}")