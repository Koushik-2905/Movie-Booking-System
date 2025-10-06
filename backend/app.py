from flask import Flask
from flask_cors import CORS

# Import all blueprints
from models import (
    users_bp, movies_bp, watchlist_bp, bookings_bp,
    payments_bp, reviews_bp, genres_bp, signup_bp, login_bp
)

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(signup_bp)
app.register_blueprint(login_bp, url_prefix="/auth")
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(movies_bp, url_prefix='/movies')
app.register_blueprint(watchlist_bp, url_prefix='/watchlist')
app.register_blueprint(bookings_bp, url_prefix='/bookings')
app.register_blueprint(payments_bp, url_prefix='/payments')
app.register_blueprint(reviews_bp, url_prefix='/reviews')
app.register_blueprint(genres_bp, url_prefix='/genres')

if __name__ == '__main__':
    app.run(debug=True)