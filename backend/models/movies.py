from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime

movies_bp = Blueprint('movies', __name__)

def parse_datetime(dt_string):
    """Parse various datetime formats and convert to MySQL format (YYYY-MM-DD HH:MM:SS)"""
    if not dt_string:
        return None
    
    # Convert to string if not already
    if not isinstance(dt_string, str):
        dt_string = str(dt_string)
    
    # If already in MySQL format, return as is
    if len(dt_string) >= 19 and dt_string[10] == ' ':
        try:
            datetime.strptime(dt_string[:19], '%Y-%m-%d %H:%M:%S')
            return dt_string[:19]
        except ValueError:
            pass
    
    # Try parsing common datetime formats
    formats = [
        '%Y-%m-%d %H:%M:%S',  # MySQL format
        '%Y-%m-%dT%H:%M:%S',  # ISO format
        '%Y-%m-%dT%H:%M:%SZ',  # ISO with Z
        '%Y-%m-%dT%H:%M:%S.%fZ',  # ISO with microseconds and Z
        '%a, %d %b %Y %H:%M:%S %Z',  # HTTP date format (e.g., "Sun, 05 Oct 2025 18:00:00 GMT")
        '%a, %d %b %Y %H:%M:%S GMT',  # HTTP date format explicit GMT
        '%Y-%m-%d %H:%M',  # Without seconds
        '%Y-%m-%d',  # Date only
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(dt_string, fmt)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except (ValueError, TypeError):
            continue
    
    # Try to extract date and time from HTTP format manually if standard parsing fails
    # Format: "Sun, 05 Oct 2025 18:00:00 GMT"
    import re
    http_match = re.match(r'[A-Za-z]{3},\s+(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})', dt_string)
    if http_match:
        day, month_str, year, hour, minute, second = http_match.groups()
        month_map = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }
        month = month_map.get(month_str)
        if month:
            return f"{year}-{month}-{day.zfill(2)} {hour}:{minute}:{second}"
    
    # If still can't parse, return None
    return None

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
    admin_email = data.get('admin_email')
    admin_password = data.get('admin_password')
    
    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401
    
    title = data.get('title')
    price = data.get('price', 0)
    available_seats = data.get('available_seats', 0)
    genre_id = data.get('genre_id')
    description = data.get('description', '')
    duration = data.get('duration', 0)
    showtime_raw = data.get('showtime')
    showtime = parse_datetime(showtime_raw) if showtime_raw else None

    # Validate required fields
    if not all([title, genre_id]):
        return jsonify({"success": False, "message": "Title and genre_id are required"}), 400
    
    if not showtime:
        return jsonify({"success": False, "message": "Showtime is required and must be in a valid format (YYYY-MM-DD HH:MM:SS)"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Verify admin credentials
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
    admin_email = data.get('admin_email')
    admin_password = data.get('admin_password')
    
    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401
    
    title = data.get('title')
    price = data.get('price')
    available_seats = data.get('available_seats')
    genre_id = data.get('genre_id')
    duration = data.get('duration')
    showtime_raw = data.get('showtime')
    showtime = parse_datetime(showtime_raw) if showtime_raw else None
    description = data.get('description')

    # Validate required fields
    if not all([title, genre_id]):
        return jsonify({"success": False, "message": "Title and genre_id are required"}), 400
    
    # If showtime is provided, validate it
    if showtime_raw and not showtime:
        return jsonify({"success": False, "message": "Invalid showtime format. Use YYYY-MM-DD HH:MM:SS format"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Verify admin credentials
        cursor.execute("SELECT is_admin FROM users WHERE email=%s AND password=%s", (admin_email, admin_password))
        r = cursor.fetchone()
        if not r or r[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403
        
        cursor.execute(
            "UPDATE movies SET title=%s, price=%s, available_seats=%s, genre_id=%s, duration=%s, showtime=%s, description=%s WHERE movie_id=%s",
            (title, price, available_seats, genre_id, duration, showtime, description, movie_id)
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