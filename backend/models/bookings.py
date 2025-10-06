from flask import Blueprint, request, jsonify
from db import get_db

bookings_bp = Blueprint('bookings', __name__)


@bookings_bp.route('', methods=['POST'])
def create_booking():
    data = request.get_json() or {}
    user_id = data.get('customer_id')  # keep naming for frontend
    if not user_id:
        return jsonify({"success": False, "message": "customer_id required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO bookings (user_id) VALUES (%s)", (user_id,))
        booking_id = cursor.lastrowid
        conn.commit()
        return jsonify({"success": True, "order_id": booking_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


