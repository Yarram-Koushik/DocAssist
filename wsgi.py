import os
import sys

# Ensure backend directory is in python module search path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app

app = create_app(os.getenv('FLASK_ENV', 'production'))

if __name__ == "__main__":
    app.run()
