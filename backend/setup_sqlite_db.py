#!/usr/bin/env python3
"""
Setup script for SQLite database
Converts MySQL schema to SQLite compatible format
"""

import sqlite3
import os
from config import DB_CONFIG

def setup_database():
    """Create SQLite database and tables"""
    
    # Ensure the database directory exists
    db_path = DB_CONFIG["database"]
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create tables (SQLite compatible version)
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                is_admin INTEGER DEFAULT 0
            )
        """)
        
        # Genres table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS genres (
                genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) UNIQUE
            )
        """)
        
        # Movies table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS movies (
                movie_id INTEGER PRIMARY KEY AUTOINCREMENT,
                genre_id INTEGER,
                title VARCHAR(150),
                price DECIMAL(10,2),
                available_seats INTEGER,
                description TEXT,
                duration INTEGER,
                showtime DATETIME,
                FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
            )
        """)
        
        # Watchlist table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS watchlist (
                watchlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                movie_id INTEGER,
                seats_selected INTEGER,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
            )
        """)
        
        # Bookings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(30) DEFAULT 'confirmed',
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        """)
        
        # Booking Items table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS booking_items (
                booking_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_id INTEGER,
                movie_id INTEGER,
                seats_booked INTEGER,
                price DECIMAL(10,2),
                FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
                FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
            )
        """)
        
        # Payments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_id INTEGER,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                amount DECIMAL(10,2),
                method VARCHAR(30),
                status VARCHAR(30),
                FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
            )
        """)
        
        # Reviews table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                review_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                movie_id INTEGER,
                rating INTEGER,
                comment TEXT,
                review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
            )
        """)
        
        # Insert default admin user
        cursor.execute("""
            INSERT OR IGNORE INTO users (name, email, password, is_admin)
            VALUES ('Admin', 'admin@moviebooking.com', 'admin123', 1)
        """)
        
        # Insert genres
        genres = [
            (1, 'Action'),
            (2, 'Comedy'),
            (3, 'Drama'),
            (4, 'Horror'),
            (5, 'Sci-Fi')
        ]
        cursor.executemany("INSERT OR IGNORE INTO genres (genre_id, name) VALUES (?, ?)", genres)
        
        # Insert movies
        movies = [
            (1, 1, 'Fast & Furious X', 299.00, 50, 'High-octane action thriller', 150, '2025-10-05 18:00:00'),
            (2, 1, 'Mission Impossible 8', 349.00, 45, 'Tom Cruise returns with impossible stunts', 160, '2025-10-05 21:00:00'),
            (3, 2, 'Laugh Out Loud', 199.00, 60, 'Comedy of the year', 120, '2025-10-06 15:00:00'),
            (4, 2, 'The Funny Bone', 199.00, 55, 'Stand-up comedy special', 110, '2025-10-06 19:00:00'),
            (5, 3, 'The Last Dance', 249.00, 40, 'Emotional drama about dreams', 140, '2025-10-07 17:00:00'),
            (6, 3, 'Broken Wings', 249.00, 35, 'A story of resilience', 135, '2025-10-07 20:00:00')
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO movies 
            (movie_id, genre_id, title, price, available_seats, description, duration, showtime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, movies)
        
        # Commit all changes
        conn.commit()
        print("Database setup completed successfully!")
        print(f"Database file: {db_path}")
        
    except Exception as e:
        conn.rollback()
        print(f"Error setting up database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    setup_database()
