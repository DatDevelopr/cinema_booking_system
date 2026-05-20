# recommendation.py

"""
Recommendation Engine thật bằng Machine Learning

Logic:
1. Tìm những user giống nhất
2. Lấy phim mà họ đã xem
3. Loại bỏ phim user hiện tại đã xem
4. Trả về top phim phù hợp nhất
"""

import pickle


def load_model():
    """
    Load model đã train
    """

    with open("movie_matrix.pkl", "rb") as f:
        movie_matrix = pickle.load(f)

    with open("user_similarity.pkl", "rb") as f:
        user_similarity = pickle.load(f)

    return movie_matrix, user_similarity


def get_fallback_movies(movie_matrix, top_n):
    """
    Cold start fallback:
    lấy top phim đầu tiên
    (sau có thể thay bằng phim hot nhất)
    """

    return list(movie_matrix.columns[:top_n])


def get_recommendations(user_id, top_n=6):
    """
    INPUT:
    user_id

    OUTPUT:
    [12, 18, 25, 30]
    """

    try:
        movie_matrix, user_similarity = load_model()

        user_id = int(user_id)

        """
        STEP 0:
        User chưa có dữ liệu
        """

        if user_id not in movie_matrix.index:
            print(f"User {user_id} chưa có dữ liệu -> fallback")

            return get_fallback_movies(
                movie_matrix,
                top_n
            )

        """
        STEP 1:
        Tìm users giống nhất
        """

        similar_users = (
            user_similarity[user_id]
            .sort_values(ascending=False)
            .drop(user_id)
        )

        if similar_users.empty:
            print("Không có similar users -> fallback")

            return get_fallback_movies(
                movie_matrix,
                top_n
            )

        top_similar_users = (
            similar_users.head(5)
            .index
            .tolist()
        )

        """
        STEP 2:
        Phim user hiện tại đã xem
        """

        watched_movies = set(
            movie_matrix.loc[user_id][
                movie_matrix.loc[user_id] > 0
            ].index
        )

        """
        STEP 3:
        Gom phim từ users tương tự
        """

        candidate_movies = {}

        for similar_user in top_similar_users:
            similar_user_movies = movie_matrix.loc[similar_user]

            watched_by_similar = similar_user_movies[
                similar_user_movies > 0
            ].index

            for movie_id in watched_by_similar:
                if movie_id not in watched_movies:
                    candidate_movies[movie_id] = (
                        candidate_movies.get(movie_id, 0) + 1
                    )

        """
        STEP 4:
        Sort theo score giảm dần
        """

        sorted_movies = sorted(
            candidate_movies.items(),
            key=lambda x: x[1],
            reverse=True
        )

        recommendations = [
            int(movie_id)
            for movie_id, score in sorted_movies[:top_n]
        ]

        """
        STEP 5:
        Nếu vẫn rỗng -> fallback
        """

        if not recommendations:
            print("Không tìm được recommendation -> fallback")

            return get_fallback_movies(
                movie_matrix,
                top_n
            )

        print(
            f"Recommendations for user {user_id}:",
            recommendations
        )

        return recommendations

    except FileNotFoundError:
        print(
            "Chưa có model. Hãy chạy train_model.py trước"
        )
        return []

    except Exception as e:
        print(
            "Recommendation error:",
            str(e)
        )
        return []