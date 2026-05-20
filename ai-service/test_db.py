# test_db.py

from database import get_connection

try:
    conn = get_connection()

    if conn.is_connected():
        print("✅ Kết nối MySQL thành công!")

        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")

        db_name = cursor.fetchone()
        print("📦 Database đang dùng:", db_name[0])

        cursor.close()
        conn.close()

        print("🔒 Đã đóng kết nối.")
    else:
        print("❌ Không thể kết nối database.")

except Exception as e:
    print("❌ Lỗi kết nối DB:")
    print(str(e))