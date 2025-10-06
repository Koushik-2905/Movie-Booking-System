from flask import Blueprint, request, jsonify
from db import get_db

watchlist_bp = Blueprint('watchlist', __name__)


def dict_from_cursor(cursor):
    cols = [c[0] for c in cursor.description]
    rows = cursor.fetchall()
    return [dict(zip(cols, r)) for r in rows]


@watchlist_bp.route('/<int:user_id>', methods=['GET'])
def get_watchlist(user_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT w.watchlist_id AS cart_id, w.movie_id, w.seats_selected AS quantity, m.title AS name, m.price "
            "FROM watchlist w JOIN movies m ON w.movie_id=m.movie_id WHERE w.user_id=%s",
            (user_id,)
        )
        data = dict_from_cursor(cursor)
        return jsonify(data)
    finally:
        cursor.close()
        conn.close()


@watchlist_bp.route('/', methods=['POST'])
def add_to_watchlist():
    data = request.get_json() or {}
    # Accept both old and new key names
    user_id = data.get('user_id') or data.get('customer_id')
    movie_id = data.get('movie_id') or data.get('product_id')
    seats_selected = int(data.get('seats_selected') or data.get('quantity') or 1)
    if not (user_id and movie_id):
        return jsonify({"success": False, "message": "user_id/customer_id and movie_id/product_id required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT seats_selected FROM watchlist WHERE user_id=%s AND movie_id=%s", (user_id, movie_id))
        r = cursor.fetchone()
        if r:
            new_seats = r[0] + seats_selected
            cursor.execute("UPDATE watchlist SET seats_selected=%s WHERE user_id=%s AND movie_id=%s", (new_seats, user_id, movie_id))
        else:
            cursor.execute("INSERT INTO watchlist (user_id, movie_id, seats_selected) VALUES (%s,%s,%s)", (user_id, movie_id, seats_selected))
        conn.commit()
        return jsonify({"success": True, "message": "Added to watchlist"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@watchlist_bp.route('/<int:watchlist_id>', methods=['DELETE'])
def remove_from_watchlist(watchlist_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM watchlist WHERE watchlist_id=%s", (watchlist_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Removed from watchlist"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()