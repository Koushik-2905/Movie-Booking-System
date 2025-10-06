from flask import Blueprint, request, jsonify
from db import get_db

login_bp = Blueprint('login', __name__)


@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not (email and password):
        return jsonify({"success": False, "message": "Email and password required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT user_id, name, email, is_admin FROM users WHERE email=%s AND password=%s",
            (email, password)
        )
        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        return jsonify({
            "success": True,
            "customer_id": row[0],  # keep key name for existing frontend
            "name": row[1],
            "email": row[2],
            "is_admin": row[3]
        })
    finally:
        cursor.close()
        conn.close()


