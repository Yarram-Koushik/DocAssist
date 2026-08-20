import uuid
from datetime import datetime

def generate_share_token():
    return uuid.uuid4().hex

def format_datetime(dt):
    return dt.isoformat() if dt else None

def paginate_query(query, page, per_page):
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    }
