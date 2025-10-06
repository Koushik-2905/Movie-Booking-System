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


@bookings_bp.route('/all', methods=['GET'])
def list_all_bookings():
    """Admin endpoint: list all bookings with user and item details."""
    admin_email = request.args.get('admin_email')
    admin_password = request.args.get('admin_password')

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Simple admin check by email/password against users table with is_admin=1
        if admin_email and admin_password:
            cursor.execute(
                "SELECT user_id FROM users WHERE email=%s AND password=%s AND is_admin=1",
                (admin_email, admin_password)
            )
            if cursor.fetchone() is None:
                return jsonify({"success": False, "message": "Unauthorized"}), 401
        else:
            return jsonify({"success": False, "message": "Admin credentials required"}), 401

        # Fetch bookings with user and aggregated item info
        cursor.execute(
            """
            SELECT b.booking_id, b.user_id, b.booking_date, b.status,
                   u.name AS user_name, u.email AS user_email,
                   bi.booking_item_id, bi.movie_id, bi.seats_booked, bi.price,
                   m.title AS movie_title
            FROM bookings b
            JOIN users u ON u.user_id = b.user_id
            LEFT JOIN booking_items bi ON bi.booking_id = b.booking_id
            LEFT JOIN movies m ON m.movie_id = bi.movie_id
            ORDER BY b.booking_date DESC, b.booking_id DESC
            """
        )

        # Group rows by booking
        rows = cursor.fetchall()
        bookings_by_id = {}
        for r in rows:
            booking_id = r[0]
            if booking_id not in bookings_by_id:
                bookings_by_id[booking_id] = {
                    "booking_id": booking_id,
                    "user_id": r[1],
                    "booking_date": r[2].isoformat() if hasattr(r[2], 'isoformat') else str(r[2]),
                    "status": r[3],
                    "user_name": r[4],
                    "user_email": r[5],
                    "items": [],
                    "total_amount": 0.0,
                    "total_seats": 0,
                }
            # Append item if exists
            booking_item_id = r[6]
            if booking_item_id is not None:
                item = {
                    "booking_item_id": booking_item_id,
                    "movie_id": r[7],
                    "seats_booked": r[8],
                    "price": float(r[9]) if r[9] is not None else 0.0,
                    "movie_title": r[10],
                }
                bookings_by_id[booking_id]["items"].append(item)
                bookings_by_id[booking_id]["total_amount"] += item["price"]
                bookings_by_id[booking_id]["total_seats"] += (item["seats_booked"] or 0)

        data = list(bookings_by_id.values())
        return jsonify(data)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

