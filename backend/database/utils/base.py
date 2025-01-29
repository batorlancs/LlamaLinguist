from typing import TYPE_CHECKING
from database.utils.assistant import DatabaseSessionManagerAssistantUtils
from database.utils.conversation import DatabaseSessionManagerConversationUtils
from database.utils.message import DatabaseSessionManagerMessageUtils
from database.utils.user import DatabaseSessionManagerUserUtils

if TYPE_CHECKING:
    from database.database import DatabaseSessionManager


class DatabaseSessionManagerUtils:
    def __init__(self, dsm: "DatabaseSessionManager"):
        self.user = DatabaseSessionManagerUserUtils(dsm)
        self.conversation = DatabaseSessionManagerConversationUtils(dsm)
        self.message = DatabaseSessionManagerMessageUtils(dsm)
        self.assistant = DatabaseSessionManagerAssistantUtils(dsm)
