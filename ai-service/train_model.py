# train_model.py

"""
Machine Learning Recommendation System
Collaborative Filtering bằng User-User Cosine Similarity

FLOW:
1. Lấy lịch sử đặt vé từ MySQL
2. Tạo ma trận user-movie
3. Tính độ tương đồng giữa users
4. Lưu model ra file pickle

Dùng cho:
recommendation.py
"""

import pandas as pd
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from database import get_connection


def load_booking_data():
    """
    Lấy dữ liệu lịch sử user đã mua vé phim

    OUTPUT:
    user_id | movie_id
    """

    conn = get_connection()

    query = """
        SELECT
            o.user_id,
            s.movie_id
        FROM orders o
        INNER JOIN order_tickets ot
            ON o.order_id = ot.order_id
        INNER JOIN tickets t
            ON ot.ticket_id = t.ticket_id
        INNER JOIN showtime_seats ss
            ON t.showtime_seat_id = ss.showtime_seat_id
        INNER JOIN showtimes s
            ON ss.showtime_id = s.showtime_id
        WHERE
            o.order_status = 'PAID'
            AND o.user_id IS NOT NULL
            AND s.movie_id IS NOT NULL
    """

    df = pd.read_sql(query, conn)
    conn.close()

    return df


def build_user_movie_matrix(df):
    """
    Tạo ma trận:

            movie_1 movie_2 movie_3
    user_1     1       0       1
    user_2     1       1       0

    Giá trị:
    > 0 nghĩa là đã từng đặt vé
    """

    matrix = pd.crosstab(
        df["user_id"],
        df["movie_id"]
    )

    return matrix

# tinh do giong nhau cua cac user
def calculate_similarity(matrix):
    """
    Tính cosine similarity giữa các users
    """

    similarity = cosine_similarity(matrix)

    similarity_df = pd.DataFrame(
        similarity,
        index=matrix.index,
        columns=matrix.index
    )

    return similarity_df


def save_model(matrix, similarity_df):
    """
    Lưu model ra file
    """

    with open("movie_matrix.pkl", "wb") as f:
        pickle.dump(matrix, f)

    with open("user_similarity.pkl", "wb") as f:
        pickle.dump(similarity_df, f)


def train_model():
    print("===================================")
    print("START TRAINING RECOMMENDATION MODEL")
    print("===================================")

    print("1. Loading booking data from MySQL...")

    df = load_booking_data()

    if df.empty:
        print("Không có dữ liệu booking để train model")
        return

    print(f"Tổng records: {len(df)}")

    print("2. Building user-movie matrix...")

    matrix = build_user_movie_matrix(df)

    print(
        f"Matrix shape: {matrix.shape[0]} users x {matrix.shape[1]} movies"
    )

    print("3. Calculating user similarity...")

    similarity_df = calculate_similarity(matrix)

    print("4. Saving model files...")

    save_model(matrix, similarity_df)

    print("===================================")
    print("TRAINING COMPLETED SUCCESSFULLY")
    print("Generated files:")
    print("- movie_matrix.pkl")
    print("- user_similarity.pkl")
    print("===================================")


if __name__ == "__main__":
    train_model()