from pyairtable import Api
from app.config import settings

def get_airtable_client() -> Api:
    return Api(settings.AIRTABLE_TOKEN)

def get_table(table_name: str):
    client = get_airtable_client()
    return client.table(settings.AIRTABLE_BASE_ID, table_name)