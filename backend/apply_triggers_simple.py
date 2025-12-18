#!/usr/bin/env python3
"""
Simple script to apply triggers to the database
Run this: py apply_triggers_simple.py
"""

from db import get_db

def apply_triggers():
    """Apply triggers to the database"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Drop existing triggers if they exist
        cursor.execute("DROP TRIGGER IF EXISTS check_watchlist_seats_before_insert")
        cursor.execute("DROP TRIGGER IF EXISTS check_watchlist_seats_before_update")
        cursor.execute("DROP TRIGGER IF EXISTS check_booking_items_seats_before_insert")
        cursor.execute("DROP TRIGGER IF EXISTS check_booking_items_seats_before_update")
        print("Dropped existing triggers if they existed")
        
        # Create trigger 1: Before INSERT on watchlist
        # Note: MySQL connector requires DELIMITER to be handled differently
        trigger1_sql = """
CREATE TRIGGER check_watchlist_seats_before_insert
BEFORE INSERT ON watchlist
FOR EACH ROW
BEGIN
    DECLARE available_count INT;
    SELECT available_seats INTO available_count
    FROM movies
    WHERE movie_id = NEW.movie_id;
    IF NEW.seats_selected > available_count THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Cannot select ', NEW.seats_selected, ' seats. Only ', available_count, ' seats are available for this movie.');
    END IF;
END
        """
        # Execute without DELIMITER - MySQL connector handles it
        for statement in trigger1_sql.strip().split(';'):
            if statement.strip():
                cursor.execute(statement)
        print("Created trigger: check_watchlist_seats_before_insert")
        
        # Create trigger 2: Before UPDATE on watchlist
        trigger2_sql = """
CREATE TRIGGER check_watchlist_seats_before_update
BEFORE UPDATE ON watchlist
FOR EACH ROW
BEGIN
    DECLARE available_count INT;
    SELECT available_seats INTO available_count
    FROM movies
    WHERE movie_id = NEW.movie_id;
    IF NEW.seats_selected > available_count THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Cannot select ', NEW.seats_selected, ' seats. Only ', available_count, ' seats are available for this movie.');
    END IF;
END
        """
        for statement in trigger2_sql.strip().split(';'):
            if statement.strip():
                cursor.execute(statement)
        print("Created trigger: check_watchlist_seats_before_update")
        
        conn.commit()
        print("\nAll triggers applied successfully!")
        
        # Show triggers
        cursor.execute("SHOW TRIGGERS")
        triggers = cursor.fetchall()
        print("\nCurrent triggers:")
        for trigger in triggers:
            print(f"  - {trigger[0]}")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    apply_triggers()

