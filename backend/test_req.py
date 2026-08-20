import requests
res = requests.post('http://127.0.0.1:5000/api/auth/register', json={
    'email': 'test5@test.com',
    'username': 'test5',
    'password': 'Password123!',
    'full_name': 'Test Five'
})
print(res.status_code)
print(res.text)
