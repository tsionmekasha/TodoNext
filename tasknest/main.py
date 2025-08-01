from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# Import your ML pipeline objects here

from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI


# Ensure GOOGLE_API_KEY is set from environment
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
else:
    raise RuntimeError("GOOGLE_API_KEY not set in environment variables.")

# 1. Load document - Assuming the file is now accessible
try:
    loader = PyPDFLoader("ToDo_App_Chatbot_Training.pdf")
    pages = loader.load()
except Exception as e:
    print(f"Error loading PDF: {e}")
    raise e

# 2. Split text
splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = splitter.split_documents(pages)

# 3. Create embeddings and vector store
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.from_documents(docs, embedding)

# 4. Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-8b",
    temperature=0.7
)

# 5. Define prompt template
prompt_template = """Use the following pieces of context to answer the question at the end. If the question is about the ToDo App, please use the provided context. If the question is not related to the ToDo App, use your general knowledge to answer.

Context: {context}

Question: {question}
Answer:"""

PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)

# 6. Create RetrievalQA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=db.as_retriever(),
    chain_type_kwargs={"prompt": PROMPT}
)

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from pymongo import MongoClient

class ChatRequest(BaseModel):
    query: str
    user_id: str = None  # Optionally pass user_id from frontend

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DBNAME = os.getenv("MONGODB_DBNAME", "tododb")

def get_live_task_count(user_id):
    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_DBNAME]
    count = db.todos.count_documents({"userId": user_id, "completed": False})
    return count

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    question = request.query.lower()
    user_id = request.user_id or "demo_user"  # Replace with real user logic

    # Always check for live count first for 'how many tasks' queries
    if "how many" in question and ("tasks" in question or "todos" in question):
        count = get_live_task_count(user_id)
        print(f"[DEBUG] userId: {user_id}, tasks left: {count}")
        # If count is valid, return it directly
        return {"response": f"You have {count} tasks left."}

    # Otherwise, use the LLM
    result = qa_chain.invoke({"query": request.query})
    # If LLM response is about tasks but doesn't give a number, try to append live count
    if (
        ("tasks" in question or "todos" in question)
        and "how many" in question
        and ("number" not in result["result"].lower() and "tasks left" not in result["result"].lower())
    ):
        count = get_live_task_count(user_id)
        return {"response": f"{result['result']}\nBy the way, you have {count} tasks left."}
    return {"response": result["result"]}
