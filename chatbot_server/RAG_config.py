import os
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient
from langchain_core.documents import Document
from dotenv import load_dotenv

load_dotenv()

# Initialize embeddings
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Connect to Qdrant Cloud
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY")
)

# Connect to collection
vectorstore = Qdrant(
    client=qdrant_client, collection_name="ecommerece-chatbot-rag", embeddings=embedding
)

retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.5, "k": 3},
)

docs = [
    Document(
        page_content="""
        Our return policy allows items to be returned within 30 days of purchase
        provided they are unused and in original packaging. Customers must have a receipt.
        """,
        metadata={"source": "return_policy.md"},
    ),
    Document(
        page_content="""
        Shipping is free on orders above $50. Orders are processed within 2 business days.
        """,
        metadata={"source": "shipping.md"},
    ),
    Document(
        page_content="""
            How to change or update the password
            Answer:
            Tell the user to head to settings tab after logging in then enter current password after that enter the new password then confirm it and click confirm.
        """,
        metadata={"source": "update_password.md"},
    ),
    Document(
        page_content=""" 
            How to change or update email:
            Answer:
            From settings click on Pen Icon next email input then enter a valid email then check email box to confirm the new email.""",
        metadata={"source": "update_email.md"},
    ),
    Document(
        page_content="""
            How to change or update first or last name or both:
            Answer:
            From settings click on the blue box with PEN  Icon then provide your new name
        """,
        metadata={"source": "update_name.md"},
    ),
]

# Upload to Qdrant
# vectorstore.add_documents(documents=docs)

# docs_retrieve = retriever.invoke("how to update my password?")

# for i in docs_retrieve:
#     print(i.page_content)

# print(" =================== Successfully to qdrant  ==================")
