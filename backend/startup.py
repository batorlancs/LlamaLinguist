from fastapi import FastAPI
from config.environment import Environment
from app_logging.app_logging import Logger
from database.database import DatabaseSessionManager
from database.schema.schema import Assistant, Message as ChatMessage, Conversation, User
from auth import get_password_hash
from sqlmodel import SQLModel


def create_tables_for_dev(app: FastAPI):
    if not Environment.is_development():
        return

    Logger.warning(app, "Running in dev mode!")
    with DatabaseSessionManager() as dsm:
        # Drop all tables first to ensure clean state
        SQLModel.metadata.drop_all(dsm.engine)
        # Create all tables fresh
        SQLModel.metadata.create_all(dsm.engine)

        # create user
        user = User(
            name="user",
            email="user@example.com",
            hashed_password=get_password_hash("password"),
        )
        dsm.utils.user.create(user)
        dsm.session.refresh(user)

        # create assistant
        assistant = Assistant(name="Gerald", model="llama3.2:1b", user_id=user.id)
        dsm.utils.assistant.create(assistant)
        dsm.session.refresh(assistant)

        # create conversation
        conversation = Conversation(
            user_id=user.id, assistant_id=assistant.id, title="First Conversation"
        )
        dsm.utils.conversation.create(conversation)
        dsm.session.refresh(conversation)  # Add this line to get the conversation ID

        # Create messages after conversation is created
        messages = [
            ChatMessage(
                role="user",
                content="If x = 2, what is x^2?",
                conversation_id=conversation.id,  # Add conversation_id
            ),
            ChatMessage(
                role="assistant",
                content="It is 4",
                conversation_id=conversation.id,  # Add conversation_id
            ),
        ]
        for message in messages:
            dsm.session.add(message)

        conversation2 = Conversation(
            user_id=user.id, assistant_id=assistant.id, title="Second Conversation"
        )
        dsm.utils.conversation.create(conversation2)
        dsm.session.refresh(conversation2)  # Add this line to get the conversation ID

        # Create messages after conversation is created
        messages2 = [
            ChatMessage(
                role="user",
                content="What is the weather in Tokyo?",
                conversation_id=conversation2.id,  # Add conversation_id
            ),
            ChatMessage(
                role="assistant",
                content="The weather in Tokyo is currently sunny with a temperature of 75 degrees Fahrenheit.",
                conversation_id=conversation2.id,  # Add conversation_id
            ),
            ChatMessage(
                role="user",
                content="Oh, that's great! Thank you!",
                conversation_id=conversation2.id,  # Add conversation_id
            ),
            ChatMessage(
                role="assistant",
                content="You're welcome! If you have any other questions, feel free to ask.",
                conversation_id=conversation2.id,  # Add conversation_id
            ),
        ]
        for message in messages2:
            dsm.session.add(message)

        dsm.session.commit()