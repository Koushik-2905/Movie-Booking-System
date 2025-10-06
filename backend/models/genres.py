from flask import Blueprint, request, jsonify
from db import get_db

genres_bp = Blueprint('genres', __name__)

def dict_from_cursor(cursor):
    cols = [c[0] for c in cursor.description]
    rows = cursor.fetchall()
    return [dict(zip(cols, r)) for r in rows]

@genres_bp.route('/', methods=['GET'])
def get_genres():
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM genres")
        data = dict_from_cursor(cursor)
        return jsonify(data)
    finally:
        cursor.close()
        conn.close()

@genres_bp.route('', methods=['POST'])
def add_genre():
    data = request.get_json()
    name = data.get("name")
    admin_email = data.get("admin_email")
    admin_password = data.get("admin_password")
    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE email=%s AND password=%s", (admin_email, admin_password))
        row = cursor.fetchone()
        if not row or row[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        cursor.execute("INSERT INTO genres (name) VALUES (%s)", (name,))
        conn.commit()
        return jsonify({"success": True, "message": "Genre added"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@genres_bp.route('/<int:genre_id>', methods=['PUT', 'DELETE'])
def modify_genre(genre_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        data = request.get_json() if request.method == "PUT" else request.args
        admin_email = data.get("admin_email")
        admin_password = data.get("admin_password")

        if not (admin_email and admin_password):
            return jsonify({"success": False, "message": "Admin credentials required"}), 401

        cursor.execute(
            "SELECT is_admin FROM users WHERE email=%s AND password=%s",
            (admin_email, admin_password)
        )
        row = cursor.fetchone()
        if not row or row[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        if request.method == "PUT":
            name = data.get("name")
            if not name:
                return jsonify({"success": False, "message": "Genre name required"}), 400
            cursor.execute("UPDATE genres SET name=%s WHERE genre_id=%s", (name, genre_id))
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Genre not found"}), 404
            conn.commit()
            return jsonify({"success": True, "message": "Genre updated"})

        else:  # DELETE
            cursor.execute("DELETE FROM genres WHERE genre_id=%s", (genre_id,))
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Genre not found"}), 404
            conn.commit()
            return jsonify({"success": True, "message": "Genre deleted"})

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()