#!/usr/bin/env python3
"""
Script to apply triggers to the database
Run this: py apply_triggers.py
"""

from db import get_db

def apply_triggers():
    """Apply triggers to the database"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Read triggers.sql file
        with open('triggers.sql', 'r', encoding='utf-8') as f:
            sql_file = f.read()
        
        # Split by DELIMITER statements and execute each part
        # Remove DELIMITER statements as they're not needed in Python
        sql_statements = []
        current_statement = []
        in_delimiter_block = False
        
        for line in sql_file.split('\n'):
            line_stripped = line.strip()
            
            if line_stripped.startswith('DELIMITER'):
                if '$$' in line_stripped:
                    in_delimiter_block = True
                else:
                    in_delimiter_block = False
                continue
            
            if in_delimiter_block:
                if line_stripped == '$$':
                    if current_statement:
                        sql_statements.append('\n'.join(current_statement))
                        current_statement = []
                    continue
                current_statement.append(line)
            else:
                if line_stripped and not line_stripped.startswith('--') and not line_stripped.startswith('USE'):
                    if line_stripped.endswith(';'):
                        sql_statements.append(line_stripped[:-1])
                    else:
                        sql_statements.append(line_stripped)
        
        # Execute each statement
        for i, statement in enumerate(sql_statements):
            if statement.strip() and not statement.strip().startswith('--'):
                try:
                    # Handle multi-statement triggers
                    if 'CREATE TRIGGER' in statement.upper():
                        # Execute trigger creation
                        cursor.execute(statement)
                        print(f"✓ Trigger {i+1} created successfully")
                    elif 'DROP TRIGGER' in statement.upper():
                        cursor.execute(statement)
                        print(f"✓ Dropped existing trigger if it existed")
                    elif 'SHOW TRIGGERS' in statement.upper():
                        cursor.execute(statement)
                        triggers = cursor.fetchall()
                        print(f"\nCurrent triggers in database:")
                        for trigger in triggers:
                            print(f"  - {trigger[0]}")
                except Exception as e:
                    error_msg = str(e)
                    if 'already exists' in error_msg.lower():
                        print(f"⚠ Trigger already exists (this is OK)")
                    else:
                        print(f"✗ Error executing statement {i+1}: {error_msg}")
        
        conn.commit()
        print("\n✓ Triggers applied successfully!")
        
    except FileNotFoundError:
        print("Error: triggers.sql file not found!")
        print("Creating triggers manually...")
        
        # Create triggers manually
        triggers = [
            """
            DROP TRIGGER IF EXISTS check_watchlist_seats_before_insert;
            """,
            """
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
            """,
            """
            DROP TRIGGER IF EXISTS check_watchlist_seats_before_update;
            """,
            """
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
        ]
        
        for trigger_sql in triggers:
            try:
                cursor.execute(trigger_sql)
                if 'CREATE TRIGGER' in trigger_sql:
                    print("✓ Trigger created successfully")
            except Exception as e:
                if 'already exists' not in str(e).lower():
                    print(f"Error: {e}")
        
        conn.commit()
        print("✓ Triggers applied!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    apply_triggers()

