import requests

def test_history():
    login = requests.post('http://127.0.0.1:5000/api/auth/login', json={'email': 'patient@example.com', 'password': 'Password123!'})
    token = login.json()['data']['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    print("\n--- Testing Chat History ---")
    res = requests.get('http://127.0.0.1:5000/api/chat/conversations', headers=headers)
    print(res.status_code, res.text[:200])

    print("\n--- Testing Report History ---")
    res = requests.get('http://127.0.0.1:5000/api/reports/', headers=headers)
    print(res.status_code, res.text[:200])

    print("\n--- Testing Medicine History ---")
    res = requests.get('http://127.0.0.1:5000/api/medicine/history', headers=headers)
    print(res.status_code, res.text[:200])

test_history()
