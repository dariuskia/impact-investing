import os
from typing import Union, List
import json

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

from openai import OpenAI
import tiktoken
import yt_dlp

from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

from dotenv import load_dotenv

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()


alpaca_api_key = os.environ.get("APCA-API-KEY-ID")
alpaca_secret_key = os.environ.get("APCA-API-SECRET-KEY")
trading_client = TradingClient(alpaca_api_key, alpaca_secret_key, paper=True)


openAIClient = OpenAI()

# uri = f"mongodb+srv://dariuskianersi:{os.environ.get("MONGODB_PW")}@impact-vector-cluster.lirvn3t.mongodb.net/?retryWrites=true&w=majority&appName=impact-vector-cluster"
vectordbUri = os.environ.get("VECTOR_DB_URL")

# Create a new client and connect to the server
vectordbClient = MongoClient(vectordbUri, server_api=ServerApi('1'))


# Send a ping to confirm a successful connection
try:
    vectordbClient.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

vectordbCollection = vectordbClient["ImpactInvesting"]["Companies"]


userdbUri = os.environ.get("DATABASE_URL")
userdbClient = MongoClient(userdbUri, server_api=ServerApi('1'))
mediaCollection = userdbClient["hoohack"]["MediaItem"]

class Media(BaseModel):
    title: str
    content: str

class CompanyVector(BaseModel):
    name: str
    content: str
    score: float


def truncate(string, max_length, encoding_name = "cl100k_base"):
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(string)
    tokens = tokens[:max_length]
    cropped = encoding.decode(tokens)
    return cropped


def get_embedding(text, model="text-embedding-3-small"):
    MAX_TOKENS = 8192
    text = text.replace("\n", " ")
    text = truncate(text, MAX_TOKENS)

    return openAIClient.embeddings.create(input = [text], model=model).data[0].embedding


def vector_search(user_query, collection) -> List[CompanyVector]:
    """
    Perform a vector search in the MongoDB collection based on the user query.

    Args:
    user_query (str): The user's query string.
    collection (MongoCollection): The MongoDB collection to search.

    Returns:
    list: A list of matching documents.
    """

    # Generate embedding for the user query
    query_embedding = get_embedding(user_query)

    if query_embedding is None:
        return "Invalid query or embedding generation failed."

    # Define the vector search pipeline
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "queryVector": query_embedding,
                "path": "embedding",
                "numCandidates": 150,  # Number of candidate matches to consider
                "limit": 2,  # Return top 4 matches
            }
        },
        {
            "$project": {
                "_id": 0,  # Exclude the _id field
                "name": 1,  # Include the name of the company
                "symbol": 1, # Include the ticker
                "content": 1,  # Include the wiki description
                "score": {"$meta": "vectorSearchScore"},  # Include the search score
            }
        },
    ]

    # Execute the search
    results = collection.aggregate(pipeline)
    return list(results)


@app.get("/")
def read_root():
    return {"Hello": "World"}


def submit_trade(symbol):
    # preparing market order
    market_order_data = MarketOrderRequest(
                        symbol=symbol,
                        qty=1,
                        side=OrderSide.BUY,
                        time_in_force=TimeInForce.DAY
                        )

    # Market order
    market_order = trading_client.submit_order(
                    order_data=market_order_data
                )


class UserItem(BaseModel):
    userid: str

@app.post("/vector")
def vector():
    print("HERE")
    print(vectordbCollection)
    print("END")
    companyVectors = vector_search("storage warehouses", vectordbCollection)
    return companyVectors

@app.post("/userget")
def userget(item: UserItem):
    print(mediaCollection)
    media_items = mediaCollection.find({"id": ObjectId(item.userid)})
    # media_items = user_document.get("mediaItems", [])
    return media_items

@app.post("/search")
# def search():
def search(item: UserItem):
    media_items = mediaCollection.find({"id": ObjectId(item.userid)})
    companies = {"companies": []} # company_name: explanation
    for item in media_items:
        messages = [
            {"role": "system", "content": "You are a helpful and informative chatbot responsible for reading the article or video transcript provided by the user and responding with a summary of the key points, objectives, and any specific strategies or solutions mentioned. Do not indicate that you are an AI or chatbot in any way: simply respond with the desired summary of the text."},
            {"role": "user", "content": "Here is the transcript for my article, titled {TITLE}:\n{TRANSCRIPT}".format(TITLE=item["title"], TRANSCRIPT=item["content"])},
        ]
        response =  openAIClient.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=messages
        )
        summary = response.choices[0].message.content
        print("Summary of media received...", summary)
        companyVectors = vector_search(summary, vectordbCollection)
        print("Company vectors found...", companyVectors)
        for vector in companyVectors:
            explanation_messages = [
                {"role": "system", "content": "You are a chatbot responsible with providing an explanation for why a user should invest in a company based on the company's alignment with the user's values and interests, synthesized from articles and media that they've consumed. The user will provide you with a summary of an article or video they've consumed, and you should respond with a compelling explanation (limit to 2-3 sentences) for why the user should invest in the company, given its description."},
                {"role": "system", "content": "Here is an in-depth description of the company named {NAME}:\n{DESCRIPTION}".format(NAME=vector["name"], DESCRIPTION=vector["content"])},
                {"role": "user", "content": "I am interested in investing in {NAME}. Here is a summary of an article I care about, titled {ARTICLE_NAME}:\n{SUMMARY}".format(NAME=vector["name"], ARTICLE_NAME=item["title"], SUMMARY=summary)},
            ]
            explanation_response = openAIClient.chat.completions.create(
                model="gpt-4-0125-preview",
                messages=explanation_messages
            )
            explanation = explanation_response.choices[0].message.content
            print("Explanation received for " + vector["name"] + "...", explanation)
            companies["companies"].append({
                "company_name": vector["name"],
                "symbol": vector["symbol"],
                "explanation": explanation
            })
        for company in companies["companies"]:
            submit_trade(company["symbol"])
        return companies # {"companies": [{"company_name": "Apple", "explanation": "Apple is a great company because..."}]}
        

class VideoItem(BaseModel):
    videoURL: str

@app.post("/transcript")
def transcript(item: VideoItem):
    vidURL = item.videoURL

    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'postprocessors': [{  # Extract audio using ffmpeg
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
        }]
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(vidURL, download=False)

        # ℹ️ ydl.sanitize_info makes the info json-serializable
        print(info)
        obj = json.loads(json.dumps(ydl.sanitize_info(info)))
        title = obj["title"]
        objId = obj["id"]
        print(json.loads(json.dumps(ydl.sanitize_info(info))))
        error_code = ydl.download([vidURL])

        audio_file = open(f"{title} [{objId}].m4a", "rb")
        transcription = openAIClient.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file
        )
        return {"transcription": transcription.text}

class SiteItem(BaseModel):
    data: str

@app.post("/extension")
def extension(item: SiteItem):
    print(item.data)
    return None