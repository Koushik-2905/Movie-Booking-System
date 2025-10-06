from flask import Blueprint, request, jsonify
from db import get_db

movies_bp = Blueprint('movies', __name__)

def dict_from_cursor(cursor):
    """Convert MySQL cursor results to a list of dictionaries"""
    cols = [c[0] for c in cursor.description]
    rows = cursor.fetchall()
    return [dict(zip(cols, r)) for r in rows]

@movies_bp.route('/', methods=['GET'])
def get_movies():
    genre_id = request.args.get('genre_id')
    conn = get_db()
    cursor = conn.cursor()
    try:
        if genre_id:
            cursor.execute(
                "SELECT m.*, g.name as genre FROM movies m "
                "LEFT JOIN genres g ON m.genre_id=g.genre_id WHERE m.genre_id=%s",
                (genre_id,)
            )
        else:
            cursor.execute(
                "SELECT m.*, g.name as genre FROM movies m "
                "LEFT JOIN genres g ON m.genre_id=g.genre_id"
            )
        data = dict_from_cursor(cursor)
        return jsonify(data)
    finally:
        cursor.close()
        conn.close()

@movies_bp.route('', methods=['POST'])
def add_movie():
    data = request.get_json()
    title = data.get('title')
    price = data.get('price', 0)
    available_seats = data.get('available_seats', 0)
    genre_id = data.get('genre_id')
    description = data.get('description', '')
    duration = data.get('duration', 0)
    showtime = data.get('showtime')
    admin_email = data.get("admin_email")
    admin_password = data.get("admin_password")

    # Validate required fields
    if not all([title, showtime, genre_id]):
        return jsonify({"success": False, "message": "Title, showtime, and genre_id are required"}), 400

    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE email=%s AND password=%s", (admin_email, admin_password))
        r = cursor.fetchone()
        if not r or r[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        cursor.execute(
            "INSERT INTO movies (genre_id, title, price, available_seats, description, duration, showtime) VALUES (%s,%s,%s,%s,%s,%s,%s)",
            (genre_id, title, price, available_seats, description, duration, showtime)
        )
        conn.commit()
        return jsonify({"success": True, "message": "Movie added"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@movies_bp.route('/<int:movie_id>', methods=['PUT'])
def update_movie(movie_id):
    data = request.get_json()
    title = data.get('title')
    price = data.get('price')
    available_seats = data.get('available_seats')
    genre_id = data.get('genre_id')
    duration = data.get('duration')
    showtime = data.get('showtime')
    admin_email = data.get("admin_email")
    admin_password = data.get("admin_password")

    # Validate required fields
    if not all([title, showtime, genre_id]):
        return jsonify({"success": False, "message": "Title, showtime, and genre_id are required"}), 400

    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE email=%s AND password=%s", (admin_email, admin_password))
        r = cursor.fetchone()
        if not r or r[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        cursor.execute(
            "UPDATE movies SET title=%s, price=%s, available_seats=%s, genre_id=%s, duration=%s, showtime=%s WHERE movie_id=%s",
            (title, price, available_seats, genre_id, duration, showtime, movie_id)
        )
        conn.commit()
        return jsonify({"success": True, "message": "Movie updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@movies_bp.route('/<int:movie_id>', methods=['DELETE'])
def delete_movie(movie_id):
    admin_email = request.args.get("admin_email")
    admin_password = request.args.get("admin_password")

    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE email=%s AND password=%s", (admin_email, admin_password))
        r = cursor.fetchone()
        if not r or r[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        cursor.execute("DELETE FROM movies WHERE movie_id=%s", (movie_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Movie deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@movies_bp.route('/purge', methods=['POST'])
def purge_movies():
    data = request.get_json() or {}
    admin_email = data.get("admin_email")
    admin_password = data.get("admin_password")
    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    allowed_titles = [
        'Fast & Furious X',
        'Mission Impossible 8',
        'Laugh Out Loud',
        'The Funny Bone',
        'The Last Dance',
        'Broken Wings',
    ]

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE email=%s AND password=%s", (admin_email, admin_password))
        r = cursor.fetchone()
        if not r or r[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        # Delete dependent entities first for movies to be removed
        format_strings = ",".join(["%s"] * len(allowed_titles))
        # Delete booking_items referencing movies to be deleted
        cursor.execute(
            f"DELETE FROM booking_items WHERE movie_id IN (SELECT movie_id FROM movies WHERE title NOT IN ({format_strings}))",
            allowed_titles,
        )
        # Delete watchlist entries
        cursor.execute(
            f"DELETE FROM watchlist WHERE movie_id IN (SELECT movie_id FROM movies WHERE title NOT IN ({format_strings}))",
            allowed_titles,
        )
        # Delete reviews (ON DELETE CASCADE on movies covers it; explicit ok)
        cursor.execute(
            f"DELETE FROM reviews WHERE movie_id IN (SELECT movie_id FROM movies WHERE title NOT IN ({format_strings}))",
            allowed_titles,
        )
        # Finally delete movies not in allowed list
        cursor.execute(
            f"DELETE FROM movies WHERE title NOT IN ({format_strings})",
            allowed_titles,
        )
        conn.commit()
        return jsonify({"success": True, "message": "Movies purged to allowed set"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()