from app.schemas.lead import (
    LeadGenerateRequest,
    LeadResponse,
    LeadUpdateRequest,
    LeadListResponse,
    LeadGenerateResponse,
)
from app.schemas.message import (
    MessageResponse,
    MessageUpdateRequest,
    MessageApproveRequest,
    MessageRejectRequest,
    MessageListResponse,
)
from app.schemas.event import (
    EventCreateRequest,
    EventResponse,
    EventCancelRequest,
    EventListResponse,
)
from app.schemas.outreach_log import (
    OutreachLogResponse,
    OutreachLogListResponse,
)
from app.schemas.reply import (
    ReplyWebhookRequest,
    ReplyResponse,
    ReplyListResponse,
)
from app.schemas.settings import (
    SettingsUpdateRequest,
    SettingsResponse,
)