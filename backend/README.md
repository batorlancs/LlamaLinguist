# FastAPI Chat Application

A simple chat application built with FastAPI and SQLModel.

## Getting Started

### Prerequisites

- Python 3.10+
- pip

### Installation

1. Clone the repository
2. Install dependencies:

### Local Development

#### Enable virtual environment

```bash
source venv/bin/activate
```

#### Run the app

```bash
fastapi run main.py --host 127.0.0.1
```

A detailed response:

```python
# @app.get("/user")
# async def user():
#     with Database() as db:
#         user = db.get_user(email="user@example.com")
#         if not user:
#             return {"user": None}

#         response = {
#             **user.model_dump(),
#             "conversations": [
#                 {
#                     **conversation.model_dump(exclude={"user_id", "assistant_id"}),
#                     "messages": [message.model_dump(exclude={"conversation_id"}) for message in conversation.messages],
#                     "assistant": conversation.assistant.model_dump()
#                 }
#                 for conversation in user.conversations
#             ]
#         }
#         return response
```
