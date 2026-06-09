from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.scheduler import scheduler
from app.airtable.tables import ensure_tables_exist
from app.routers import (
    leads_router,
    messages_router,
    events_router,
    outreach_router,
    replies_router,
    dashboard_router,
    settings_router,
    campaigns_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_tables_exist()
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="Catering Agent API",
    version="1.0.0",
    description="AI-powered catering lead generation and outreach automation.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads_router)
app.include_router(messages_router)
app.include_router(events_router)
app.include_router(outreach_router)
app.include_router(replies_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(campaigns_router)


@app.get("/")
def root():
    return {"message": "Catering Agent API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, app_dir="app")