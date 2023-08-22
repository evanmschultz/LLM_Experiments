import chromadb
from chromadb.api import API as ChromadbAPI

chroma_client: ChromadbAPI = chromadb.Client()

collection: chromadb.Collection = chroma_client.create_collection(name="my_collection")

collection.add(
    ids=["1", "2"],
    documents=["Juice is a liquid", "Stones are not a liquid"],
    metadatas=[{"source": "My mind"}, {"source": "My mind"}],
)

results = collection.query(query_texts=["What is juice?"], n_results=2)
print(results)
