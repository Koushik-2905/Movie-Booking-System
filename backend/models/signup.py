from flask import Blueprint, request, jsonify
from db import get_db

signup_bp = Blueprint('signup', __name__)


@signup_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not (name and email and password):
        return jsonify({"success": False, "message": "Name, email and password required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Email already registered"}), 400

        cursor.execute(
            "INSERT INTO users (name,email,password) VALUES (%s,%s,%s)",
            (name, email, password)
        )
        conn.commit()
        return jsonify({"success": True, "message": "Signup successful"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


