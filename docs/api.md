# DocAssist API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Auth APIs

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "role": "user",
      "full_name": "John Doe"
    }
  }
}
```

---

### POST `/api/auth/login`
Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": { ... }
  }
}
```

---

### POST `/api/auth/refresh`
Refresh access token. Requires refresh token.

**Headers:** `Authorization: Bearer <refresh_token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "access_token": "eyJ..." }
}
```

---

### GET `/api/auth/me`
Get current user profile. 🔒 Protected.

### PUT `/api/auth/me`
Update user profile. 🔒 Protected.

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "date_of_birth": "1990-01-15",
  "gender": "male"
}
```

### PUT `/api/auth/me/password`
Change password. 🔒 Protected.

**Request Body:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

---

## Chat APIs

### POST `/api/chat/conversations`
Create a new conversation. 🔒 Protected.

**Request Body:**
```json
{ "title": "Health Question" }
```

### GET `/api/chat/conversations`
List user's conversations. 🔒 Protected.

**Query:** `?page=1&per_page=20`

### GET `/api/chat/conversations/:id`
Get conversation with messages. 🔒 Protected.

### DELETE `/api/chat/conversations/:id`
Delete a conversation. 🔒 Protected.

### POST `/api/chat/conversations/:id/messages`
Send a message and get AI response. 🔒 Protected.

**Request Body:**
```json
{ "message": "What is dengue fever?" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_message": { "id": 1, "role": "user", "message": "..." },
    "assistant_message": {
      "id": 2,
      "role": "assistant",
      "message": "Dengue fever is...",
      "sources": [
        { "title": "dengue_fever.txt", "content": "..." }
      ],
      "confidence_score": 0.85,
      "related_topics": ["Malaria", "Mosquito-borne diseases"],
      "follow_up_questions": ["How is dengue diagnosed?"]
    },
    "emergency": false
  }
}
```

---

## Report APIs

### POST `/api/reports/upload`
Upload a medical report. 🔒 Protected.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | PDF, PNG, JPG, JPEG (max 16MB) |
| report_type | String | No | CBC, Thyroid, Blood Sugar, etc. |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "report_type": "CBC",
    "extracted_values": [
      { "parameter": "Hemoglobin", "value": 14.5, "unit": "g/dL", "status": "normal" }
    ],
    "ai_explanation": "Your hemoglobin level appears within the normal reference range...",
    "reference_ranges": { ... }
  }
}
```

### GET `/api/reports`
List user's reports. 🔒 Protected.

### GET `/api/reports/:id`
Get report details. 🔒 Protected.

### DELETE `/api/reports/:id`
Delete a report. 🔒 Protected.

---

## Medicine APIs

### POST `/api/medicine/search`
Search for medicine information. 🔒 Protected.

**Request Body:**
```json
{ "query": "paracetamol" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "generic_name": "ACETAMINOPHEN",
    "brand_names": ["TYLENOL", "PANADOL"],
    "uses": "For temporary relief of minor aches and pains...",
    "side_effects": "Nausea, stomach upset...",
    "warnings": "Liver warning...",
    "contraindications": "Known allergy to acetaminophen",
    "when_to_consult_doctor": "Consult your doctor before use if...",
    "source": "openFDA - U.S. Food and Drug Administration",
    "disclaimer": "..."
  }
}
```

### GET `/api/medicine/history`
User's medicine search history. 🔒 Protected.

---

## Summary APIs

### POST `/api/summary/generate`
Generate a doctor-ready summary. 🔒 Protected.

**Request Body:**
```json
{
  "conversation_id": 1,
  "report_ids": [1, 2]
}
```

### GET `/api/summary`
List user's summaries. 🔒 Protected.

### GET `/api/summary/:id`
Get summary details. 🔒 Protected.

### GET `/api/summary/:id/export?format=pdf`
Export summary as PDF or TXT. 🔒 Protected.

### POST `/api/summary/:id/share`
Generate shareable link. 🔒 Protected.

### GET `/api/summary/share/:token`
View shared summary. 🔓 Public.

---

## History APIs

### GET `/api/history/chats?days=7`
Recent chat messages. 🔒 Protected.

### GET `/api/history/reports`
Recent reports. 🔒 Protected.

### GET `/api/history/medicines`
Recent medicine searches. 🔒 Protected.

### GET `/api/history/summaries`
Recent summaries. 🔒 Protected.

### GET `/api/history/overview`
Combined dashboard overview. 🔒 Protected.

---

## Feedback APIs

### POST `/api/feedback`
Submit feedback. 🔒 Protected.

**Request Body:**
```json
{
  "chat_id": 5,
  "rating": 4,
  "comment": "Very helpful response!"
}
```

### GET `/api/feedback`
List all feedback. 🔒 Admin only.

---

## Analytics APIs

### POST `/api/analytics/track`
Track an analytics event. 🔒 Protected.

### GET `/api/analytics/user`
User's personal analytics. 🔒 Protected.

---

## Admin APIs (Admin Role Required)

### GET `/api/admin/stats`
Overview statistics.

### GET `/api/admin/users?page=1&per_page=20`
Paginated user list with per-user stats.

### GET `/api/admin/analytics/chats?days=30`
Chat volume over time.

### GET `/api/admin/analytics/reports`
Report type distribution.

### GET `/api/admin/analytics/emergencies`
Emergency alerts over time and by type.

### GET `/api/admin/analytics/feedback`
Feedback rating distribution.

### GET `/api/admin/analytics/medicines`
Top searched medicines.

### GET `/api/admin/analytics/symptoms`
Most common symptoms/topics.

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource doesn't exist |
| 409 | Conflict — Duplicate resource |
| 500 | Server Error — Internal error |

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (default: 1)
- `per_page` (default: 20)

**Response includes:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "pages": 5
}
```
