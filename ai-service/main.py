from fastapi import FastAPI
from recommendation import get_recommendations

app = FastAPI(
    title="Cinema AI Recommendation Service",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "AI Recommendation Service is running"
    }


@app.get("/recommend/{user_id}")
def recommend_movies(user_id: int):
    movie_ids = get_recommendations(user_id)

    return {
        "user_id": user_id,
        "recommended_movies": movie_ids
    }

# uvicorn main:app --reload