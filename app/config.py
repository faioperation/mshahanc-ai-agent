from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    APIFY_TOKEN: str
    APIFY_ACTOR_ID: str = "compass~crawler-google-places"

    AIRTABLE_TOKEN: str
    AIRTABLE_BASE_ID: str

    OPENAI_API_KEY: str

    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_PHONE_NUMBER: str

    GMAIL_CLIENT_ID: str
    GMAIL_CLIENT_SECRET: str
    GMAIL_REFRESH_TOKEN: str
    GMAIL_SENDER_EMAIL: str

    N8N_EMAIL_WEBHOOK_URL: str
    N8N_SMS_WEBHOOK_URL: str

    TEST_MODE: bool = False
    TEST_EMAIL: str = ""
    TEST_PHONE: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()