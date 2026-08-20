import requests

# We need a JWT token first
login = requests.post('http://127.0.0.1:5000/api/auth/login', json={
    'email': 'patient@example.com',
    'password': 'Password123!'
})
token = login.json()['data']['access_token']

res = requests.post('http://127.0.0.1:5000/api/chat/conversations/1/messages', 
    json={'message': 'Headache symptoms'},
    headers={'Authorization': f'Bearer {token}'}
)
print(res.status_code)
print(res.text)
