const {
  User,
  Movie,
  Genre,
  MovieGenre,
  UserPreference,
  UserMovieView,
  Order,
  OrderTicket,
  Ticket,
  ShowtimeSeat,
  Showtime,
  sequelize,
} = require("../models");
const axios = require("axios");

const { Op, fn, col, literal } = require("sequelize");

/*
==================================================
1. PHIM HOT TUẦN NÀY
GET /api/recommendations/hot
==================================================
*/

exports.getHotMovies = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);

    const rows = await OrderTicket.findAll({
      attributes: [
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.movie_id"
          ),
          "movie_id",
        ],
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.title"
          ),
          "title",
        ],
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.poster_url"
          ),
          "poster_url",
        ],
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.duration"
          ),
          "duration",
        ],
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.slug"
          ),
          "slug",
        ],
        [
          fn(
            "COUNT",
            col("OrderTicket.ticket_id")
          ),
          "tickets_sold",
        ],
      ],

      include: [
        {
          model: Order,
          required: true,
          attributes: [],
          where: {
            order_status: "PAID",
          },
        },
        {
          model: Ticket,
          required: true,
          attributes: [],
          include: [
            {
              model: ShowtimeSeat,
              required: true,
              attributes: [],
              include: [
                {
                  model: Showtime,
                  required: true,
                  attributes: [],
                  include: [
                    {
                      model: Movie,
                      required: true,
                      attributes: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      group: [
        "Ticket.ShowtimeSeat.Showtime.Movie.movie_id",
        "Ticket.ShowtimeSeat.Showtime.Movie.title",
        "Ticket.ShowtimeSeat.Showtime.Movie.poster_url",
        "Ticket.ShowtimeSeat.Showtime.Movie.duration",
        "Ticket.ShowtimeSeat.Showtime.Movie.slug",
      ],

      order: [
        [literal("tickets_sold"), "DESC"],
      ],

      limit,
      raw: true,
      subQuery: false,
    });

    return res.json({
      success: true,
      type: "HOT_MOVIES",
      data: rows,
    });
  } catch (error) {
    console.error(
      "GET HOT MOVIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get hot movies failed",
      error: error.message,
    });
  }
};

/*
==================================================
2. LƯU SỞ THÍCH THỂ LOẠI
POST /api/recommendations/preferences

body:
{
  genre_ids: [1,2,3]
}
==================================================
*/

exports.saveUserPreferences = async (
  req,
  res
) => {
  const t = await sequelize.transaction();

  try {
    const user_id = req.user.user_id;
    const { genre_ids } = req.body;

    if (
      !genre_ids ||
      !Array.isArray(genre_ids) ||
      genre_ids.length === 0
    ) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "genre_ids is required",
      });
    }

    /*
    XÓA preference cũ
    */

    await UserPreference.destroy({
      where: { user_id },
      transaction: t,
    });

    /*
    INSERT mới
    */

    const payload = genre_ids.map(
      (genre_id) => ({
        user_id,
        genre_id,
      })
    );

    await UserPreference.bulkCreate(
      payload,
      {
        transaction: t,
      }
    );

    await t.commit();

    return res.json({
      success: true,
      message:
        "Saved preferences successfully",
    });
  } catch (error) {
    await t.rollback();

    console.error(
      "SAVE USER PREFERENCES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Save preferences failed",
      error: error.message,
    });
  }
};

/*
==================================================
3. TRACK USER VIEW MOVIE
POST /api/recommendations/track-view

body:
{
   movie_id: 12
}
==================================================
*/

exports.trackMovieView = async (
  req,
  res
) => {
  try {
    const user_id = req.user.user_id;
    const { movie_id } = req.body;

    if (!movie_id) {
      return res.status(400).json({
        success: false,
        message: "movie_id is required",
      });
    }

    await UserMovieView.create({
      user_id,
      movie_id,
      viewed_at: new Date(),
    });

    return res.json({
      success: true,
      message:
        "Movie view tracked successfully",
    });
  } catch (error) {
    console.error(
      "TRACK MOVIE VIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Track movie view failed",
      error: error.message,
    });
  }
};

/*
==================================================
4. AI GỢI Ý PHIM CHO USER
GET /api/recommendations/for-you

ƯU TIÊN:
1. Lịch sử đặt vé
2. Lịch sử xem phim
3. Sở thích chọn tay
4. Fallback phim hot
==================================================
*/

exports.getRecommendedMovies =
  async (req, res) => {
    try {
      const user_id = req.user.user_id;
      const limit = Number(
        req.query.limit || 8
      );

      let genreIds = [];

      /*
      ==========================================
      STEP 1
      LẤY THEO LỊCH SỬ ĐẶT VÉ
      ==========================================
      */

      const bookedGenres =
        await sequelize.query(
          `
        SELECT
          mg.genre_id,
          COUNT(*) as total
        FROM orders o
        JOIN order_tickets ot
          ON o.order_id = ot.order_id
        JOIN tickets t
          ON ot.ticket_id = t.ticket_id
        JOIN showtime_seats ss
          ON t.showtime_seat_id = ss.showtime_seat_id
        JOIN showtimes s
          ON ss.showtime_id = s.showtime_id
        JOIN movie_genres mg
          ON s.movie_id = mg.movie_id
        WHERE
          o.user_id = :user_id
          AND o.order_status = 'PAID'
        GROUP BY mg.genre_id
        ORDER BY total DESC
        LIMIT 5
        `,
          {
            replacements: {
              user_id,
            },
            type:
              sequelize.QueryTypes.SELECT,
          }
        );

      genreIds = bookedGenres.map(
        (item) => item.genre_id
      );

      /*
      ==========================================
      STEP 2
      LẤY THEO LỊCH SỬ XEM CHI TIẾT PHIM
      ==========================================
      */

      if (genreIds.length === 0) {
        const viewedGenres =
          await sequelize.query(
            `
          SELECT
            mg.genre_id,
            COUNT(*) as total
          FROM user_movie_views uv
          JOIN movie_genres mg
            ON uv.movie_id = mg.movie_id
          WHERE
            uv.user_id = :user_id
          GROUP BY mg.genre_id
          ORDER BY total DESC
          LIMIT 5
          `,
            {
              replacements: {
                user_id,
              },
              type:
                sequelize.QueryTypes
                  .SELECT,
            }
          );

        genreIds = viewedGenres.map(
          (item) => item.genre_id
        );
      }

      /*
      ==========================================
      STEP 3
      LẤY THEO SỞ THÍCH USER CHỌN
      ==========================================
      */

      if (genreIds.length === 0) {
        const preferences =
          await UserPreference.findAll({
            where: { user_id },
            attributes: ["genre_id"],
            raw: true,
          });

        genreIds = preferences.map(
          (item) => item.genre_id
        );
      }

      /*
      ==========================================
      STEP 4
      KHÔNG CÓ GÌ -> PHIM HOT
      ==========================================
      */

      if (genreIds.length === 0) {
        return exports.getHotMovies(
          req,
          res
        );
      }

      /*
      ==========================================
      STEP 5
      LẤY DANH SÁCH PHIM THEO GENRE
      ==========================================
      */

      const movies =
        await Movie.findAll({
          attributes: [
            "movie_id",
            "title",
            "poster_url",
            "duration",
            "release_date",
            "director",
          ],

          include: [
            {
              model: Genre,
              required: true,
              attributes: [
                "genre_id",
                "genre_name",
              ],
              through: {
                attributes: [],
              },
              where: {
                genre_id: {
                  [Op.in]: genreIds,
                },
              },
            },
          ],

          order: [
            ["created_at", "DESC"],
          ],

          limit,
          distinct: true,
        });

      return res.json({
        success: true,
        type:
          "PERSONALIZED_RECOMMENDATION",
        based_on_genres: genreIds,
        data: movies,
      });
    } catch (error) {
      console.error(
        "GET RECOMMENDED MOVIES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Get recommendation failed",
        error: error.message,
      });
    }
  };




/*
==================================================
AI RECOMMENDATION
Node.js -> gọi Python FastAPI Service
==================================================
API:
GET /api/recommendations/ai/:user_id
==================================================
*/

/*
==================================================
AI RECOMMENDATION
Node.js -> gọi Python FastAPI Service

Logic:
- Nếu user chưa có lịch sử đặt vé:
  => lời dẫn khác (cold start)

- Nếu user đã có lịch sử:
  => lời dẫn cá nhân hóa thật sự
==================================================
*/

exports.getAIRecommendedMovies = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    /*
    ==========================================
    STEP 1: Lấy thông tin user
    ==========================================
    */

    const user = await User.findOne({
      where: { user_id },
      attributes: ["full_name"],
      raw: true,
    });

    const userName = user?.full_name || "bạn";

    /*
    ==========================================
    STEP 2: Kiểm tra user đã từng đặt vé chưa
    ==========================================
    */

    const paidOrderCount = await Order.count({
      where: {
        user_id,
        order_status: "PAID",
      },
    });

    const hasBookingHistory = paidOrderCount > 0;

    /*
    ==========================================
    STEP 3: Gọi Python AI Service
    ==========================================
    */

    const aiResponse = await axios.get(
      `http://127.0.0.1:8000/recommend/${user_id}`
    );

    const recommendedMovieIds =
      aiResponse?.data?.recommended_movies || [];

    /*
    ==========================================
    STEP 4: Nội dung AI theo từng trường hợp
    ==========================================
    */

    let aiIntro = "";
    let aiReason = "";
    let aiClosing = "";

    /*
    ------------------------------------------
    CASE 1: Đã có lịch sử đặt vé
    ------------------------------------------
    */

    if (hasBookingHistory) {
      aiIntro = `Xin chào ${userName}! Dưới đây là những bộ phim AI đã chọn riêng cho bạn dựa trên lịch sử đặt vé và sở thích xem phim của bạn.`;

      aiReason =
        aiResponse?.data?.reason ||
        "Chúng tôi phân tích những bộ phim bạn đã xem, thể loại bạn yêu thích và hành vi của những người có gu phim tương tự để đưa ra gợi ý phù hợp nhất.";

      aiClosing =
        aiResponse?.data?.closing ||
        "Cảm ơn bạn đã tin tưởng hệ thống gợi ý phim thông minh của chúng tôi. Chúc bạn có những trải nghiệm điện ảnh thật tuyệt vời và nhiều cảm xúc đáng nhớ!";
    }

    /*
    ------------------------------------------
    CASE 2: Chưa có lịch sử đặt vé
    ------------------------------------------
    */

    else {
      aiIntro = `Xin chào ${userName}! Hiện tại bạn chưa có nhiều lịch sử xem phim, vì vậy AI đang gợi ý những bộ phim nổi bật và được yêu thích nhất dành cho bạn.`;

      aiReason =
        "Khi bạn bắt đầu đặt vé và khám phá thêm nhiều bộ phim, hệ thống sẽ hiểu rõ sở thích của bạn hơn để cá nhân hóa các gợi ý chính xác hơn.";

      aiClosing =
        "Cảm ơn bạn đã ghé thăm hệ thống của chúng tôi. Chúc bạn sớm tìm được bộ phim thật ưng ý cho buổi xem sắp tới!";
    }

    /*
    ==========================================
    STEP 5: Nếu không có recommendation
    ==========================================
    */

    if (!recommendedMovieIds.length) {
      return res.json({
        success: true,
        type: "AI_RECOMMENDATION",
        intro: aiIntro,
        reason: aiReason,
        data: [],
        closing: aiClosing,
      });
    }

    /*
    ==========================================
    STEP 6: Query DB lấy full movie info
    ==========================================
    */

    const movies = await Movie.findAll({
      where: {
        movie_id: recommendedMovieIds,
      },
      include: [
        {
          model: Genre,
          through: {
            attributes: [],
          },
          attributes: [
            "genre_id",
            "genre_name",
          ],
        },
      ],
    });

    /*
    ==========================================
    STEP 7: Giữ đúng thứ tự AI recommendation
    ==========================================
    */

    const sortedMovies = recommendedMovieIds
      .map((id) =>
        movies.find(
          (movie) => movie.movie_id === id
        )
      )
      .filter(Boolean);

    /*
    ==========================================
    RESPONSE CHUẨN
    ==========================================
    */

    return res.json({
      success: true,
      type: "AI_RECOMMENDATION",
      hasBookingHistory,
      intro: aiIntro,
      reason: aiReason,
      data: sortedMovies,
      closing: aiClosing,
    });
  } catch (error) {
    console.error(
      "GET AI RECOMMENDED MOVIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Không thể lấy AI recommendation",
      error: error.message,
    });
  }
};