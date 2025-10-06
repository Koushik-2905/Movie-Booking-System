from flask import Blueprint, jsonify, request
from db import get_db

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/<int:movie_id>', methods=['GET'])
def get_reviews(movie_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT r.review_id, r.rating, r.comment, r.review_date, u.name FROM reviews r "
            "LEFT JOIN users u ON r.user_id=u.user_id WHERE r.movie_id=%s",
            (movie_id,)
        )
        cols = [c[0] for c in cursor.description]
        rows = cursor.fetchall()
        data = [dict(zip(cols, r)) for r in rows]
        return jsonify(data)
    finally:
        cursor.close()
        conn.close()


@reviews_bp.route('', methods=['POST'])
def add_review():
    data = request.get_json() or {}
    user_id = data.get('user_id') or data.get('customer_id')
    movie_id = data.get('movie_id') or data.get('product_id')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not all([user_id, movie_id, rating is not None]):
        return jsonify({"success": False, "message": "user_id, movie_id, and rating required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (%s,%s,%s,%s)",
            (user_id, movie_id, rating, comment)
        )
        conn.commit()
        return jsonify({"success": True, "message": "Review submitted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


