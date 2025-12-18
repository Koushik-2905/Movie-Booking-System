#!/usr/bin/env python3
"""
Script to add selected_seats column to watchlist table
Run this: py add_selected_seats.py
"""

from db import get_db

def add_selected_seats_column():
    """Add selected_seats column to watchlist table if it doesn't exist"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'watchlist'
            AND COLUMN_NAME = 'selected_seats'
        """)
        
        column_exists = cursor.fetchone()[0] > 0
        
        if column_exists:
            print("Column 'selected_seats' already exists in watchlist table.")
        else:
            # Add the column
            cursor.execute("""
                ALTER TABLE watchlist 
                ADD COLUMN selected_seats VARCHAR(500) DEFAULT NULL 
                COMMENT 'Comma-separated list of selected seat IDs'
            """)
            conn.commit()
            print("Successfully added 'selected_seats' column to watchlist table!")
        
        # Verify the table structure
        cursor.execute("DESCRIBE watchlist")
        columns = cursor.fetchall()
        print("\nCurrent watchlist table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
            
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_selected_seats_column()

