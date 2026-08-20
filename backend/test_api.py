import requests
import time

def test_apis():
    # Login
    res = requests.post('http://127.0.0.1:5000/api/auth/login', json={'email': 'patient@example.com', 'password': 'Password123!'})
    if res.status_code != 200:
        print("Login failed:", res.text)
        return
    token = res.json()['data']['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print("Login successful.")

    # 1. Chat send message
    print("\n--- Testing Chat POST ---")
    res = requests.post('http://127.0.0.1:5000/api/chat/conversations/1/messages', 
        json={'message': 'Headache symptoms'}, headers=headers)
    print(f"Status: {res.status_code}")
    print(res.text[:500])
    
    # 2. Chat get conversation
    print("\n--- Testing Chat GET ---")
    res = requests.get('http://127.0.0.1:5000/api/chat/conversations/1', headers=headers)
    print(f"Status: {res.status_code}")
    print(res.text[:500])

    # 3. Medicine search
    print("\n--- Testing Medicine Search ---")
    res = requests.post('http://127.0.0.1:5000/api/medicine/search', json={'query': 'aspirin'}, headers=headers)
    print(f"Status: {res.status_code}")
    print(res.text[:500])

test_apis()
