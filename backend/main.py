import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Chatbot API")

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Cerebras client
client = Cerebras(
    api_key=os.environ.get("CEREBRAS_API_KEY")
)

class ChatMessage(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "Backend is running!"}

@app.post("/chat")
def chat_endpoint(chat_message: ChatMessage):
    if not os.environ.get("CEREBRAS_API_KEY"):
        raise HTTPException(status_code=500, detail="Cerebras API key not configured")

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": chat_message.message}
            ],
            model="llama3.1-8b",
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
