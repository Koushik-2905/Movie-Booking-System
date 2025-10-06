from flask import Blueprint, request, jsonify
from db import get_db

users_bp = Blueprint('users', __name__)


def dict_from_cursor(cursor):
    cols = [c[0] for c in cursor.description]
    rows = cursor.fetchall()
    return [dict(zip(cols, r)) for r in rows]


@users_bp.route('', methods=['POST'])
def add_user():
    data = request.get_json()
    admin_email = data.get("admin_email")
    admin_password = data.get("admin_password")

    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT is_admin FROM users WHERE email=%s AND password=%s",
            (admin_email, admin_password)
        )
        row = cursor.fetchone()
        if not row or row[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        is_admin = data.get("is_admin", 0)

        if not (name and email and password):
            return jsonify({"success": False, "message": "Name, email, and password are required"}), 400

        cursor.execute("SELECT user_id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Email already registered"}), 400

        cursor.execute(
            "INSERT INTO users (name, email, password, is_admin) VALUES (%s, %s, %s, %s)",
            (name, email, password, is_admin)
        )
        conn.commit()
        return jsonify({"success": True, "message": "User added successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@users_bp.route('/', methods=['GET'])
def get_users():
    admin_email = request.args.get('admin_email')
    admin_password = request.args.get('admin_password')
    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE email=%s AND password=%s", (admin_email, admin_password))
        r = cursor.fetchone()
        if not r or r[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        cursor.execute("SELECT user_id, name, email, is_admin FROM users")
        data = dict_from_cursor(cursor)
        return jsonify(data)
    finally:
        cursor.close()
        conn.close()


@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    admin_email = request.args.get("admin_email")
    admin_password = request.args.get("admin_password")
    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT is_admin FROM users WHERE email=%s AND password=%s",
            (admin_email, admin_password)
        )
        row = cursor.fetchone()
        if not row or row[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        cursor.execute("DELETE FROM users WHERE user_id=%s", (user_id,))
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "User not found"}), 404

        conn.commit()
        return jsonify({"success": True, "message": "User deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@users_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    admin_email = data.get("admin_email")
    admin_password = data.get("admin_password")
    if not (admin_email and admin_password):
        return jsonify({"success": False, "message": "Admin credentials required"}), 401

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    is_admin = data.get('is_admin')

    if not any([name, email, password, is_admin is not None]):
        return jsonify({"success": False, "message": "At least one field required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT is_admin FROM users WHERE email=%s AND password=%s",
            (admin_email, admin_password)
        )
        row = cursor.fetchone()
        if not row or row[0] != 1:
            return jsonify({"success": False, "message": "Not authorized"}), 403

        cursor.execute("SELECT user_id FROM users WHERE user_id=%s", (user_id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "User not found"}), 404

        updates = []
        values = []
        if name:
            updates.append("name=%s")
            values.append(name)
        if email:
            updates.append("email=%s")
            values.append(email)
        if password:
            updates.append("password=%s")
            values.append(password)
        if is_admin is not None:
            updates.append("is_admin=%s")
            values.append(is_admin)

        values.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE user_id=%s"
        cursor.execute(query, values)
        conn.commit()
        return jsonify({"success": True, "message": "User updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()