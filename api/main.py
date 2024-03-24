import os
from typing import Union, List

from fastapi import FastAPI
from pydantic import BaseModel

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

from openai import OpenAI
import tiktoken

from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

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
#     media_items = [
#         {
#             "title": "Russia mourns victims of concert shooting",
#             "content": """
#             MOSCOW, March 24 (Reuters) - Russia lowered flags to half-mast on Sunday for a day of mourning after scores of people were gunned down with automatic weapons at a rock concert outside Moscow in the deadliest attack inside Russia for two decades.
# President Vladimir Putin declared a national day of mourning after pledging to track down and punish all those behind the attack, which left 133 people dead, including three children, and more than 150 were injured.
# "I express my deep, sincere condolences to all those who lost their loved ones," Putin said in an address to the nation on Saturday, his first public comments on the attack. "The whole country and our entire people are grieving with you."
# The Islamic State claimed responsibility for Friday's attack, but Putin has not publicly mentioned the militant group in connection with the attackers, who he said had been trying to escape to Ukraine, He asserted that some on "the Ukrainian side" had prepared to spirit them across the border.
# Ukraine has repeatedly denied any role in the attack, which Putin also blamed on "international terrorism".
# People laid flowers at Crocus City Hall, the 6,200-seat concert hall outside Moscow where four armed men burst in on Friday just before Soviet-era rock group Picnic was to perform its hit "Afraid of Nothing".
# The men fired their automatic weapons in short bursts at terrified civilians who fell screaming in a hail off bullets.
# It was the deadliest attack on Russian territory since the 2004 Beslan school siege, when Islamist militants took more than 1,000 people, including hundreds of children, hostage.
# Long lines formed in Moscow on Saturday to donate blood.
# In the southwestern city of Voronezh, people were laying flowers and lighting candles at a monument to children who died there in a World War Two bombing, in solidarity with those who died in the attack near Moscow.
# "We, like the whole country, are with you," the governor of the Voronezh region, Alexander Gusev, said on the Telegram messaging app.
# GUNMEN
# Putin said 11 people had been detained, including the four gunmen, who fled the concert hall and made their way to the Bryansk region, about 340 km (210 miles) southwest of Moscow.
# "They tried to hide and moved towards Ukraine, where, according to preliminary data, a window was prepared for them on the Ukrainian side to cross the state border," Putin said.
# Russia's Federal Security Service (FSB) said the gunmen had contacts in Ukraine and were captured near the border.
# Putin ordered a full-scale invasion of Ukraine in February 2022, triggering a major European war after eight years of conflict in eastern Ukraine between Ukrainian forces on one side and pro-Russian Ukrainians and Russian proxies on the other.
# Ukrainian President Volodymyr Zelenskiy said it was typical of Putin and "other thugs" to seek to divert blame.
# In video footage published by Russian media and Telegram channels with close ties to the Kremlin, one of the suspects said he was offered money to carry out the attack.
# "I shot people," the suspect, his hands tied and his hair held by an interrogator, a black boot beneath his chin, said in poor and highly accented Russian.
# When asked why, he said: "For money." The man said he had been promised half a million roubles (a little over $5,000). One was shown answering questions through a Tajik translator.
# ISLAMIC STATE
# Islamic State, the Islamist group that once sought control over swathes of Iraq and Syria, claimed responsibility for the attack, the group's Amaq agency said on Telegram.
# Putin changed the course of the Syrian civil war by intervening in 2015, supporting President Bashar al-Assad against the opposition and Islamic State.
# It was unclear why Islamic State chose this moment to strike Russia.
# The White House said the U.S. government shared information with Russia early this month about a planned attack in Moscow, and issued a public advisory to Americans in Russia on March 7. It said Islamic State bore sole responsibility for the attack.
# "There was no Ukrainian involvement whatsoever," U.S. National Security Council spokesperson Adrienne Watson said.
#             """
#         }
#     ]
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
        return companies # {"companies": [{"company_name": "Apple", "explanation": "Apple is a great company because..."}]}
        