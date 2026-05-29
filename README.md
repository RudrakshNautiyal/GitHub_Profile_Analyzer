# GitHub Profile Analyzer API

A backend REST API service built with Node.js, Express, and MySQL that analyzes GitHub user profiles using the GitHub Public API and stores useful insights in a MySQL database.

---

## Live API

Base URL: `https://YOUR_DEPLOYED_URL.railway.app`

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Third-Party API:** GitHub REST API
- **Libraries:** Axios, mysql2, dotenv, nodemon

---

## Features

- Fetch and analyze any GitHub user's public profile
- Store insights: followers, repos, bio, location, avatar, top language
- Auto-calculated profile score based on followers and repos
- Re-analysis support — updates existing profiles instead of duplicating
- Top programming language detection from public repositories
- Fetch all analyzed profiles ranked by profile score
- Fetch a single stored profile by username
- Proper error handling for invalid/non-existent usernames

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check — confirms API is running |
| POST | `/api/analyze/:username` | Analyze and store a GitHub profile |
| GET | `/api/profiles` | Get all analyzed profiles |
| GET | `/api/profiles/:username` | Get a single profile by username |

---

## Local Setup Instructions

### Prerequisites

- Node.js v18 or above
- MySQL 8.0 or above
- npm

### Step 1 — Clone the repository

```bash
git clone https://github.com/RudrakshNauiyal/github-profile-analyzer.git
cd github-profile-analyzer
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create .env file

Create a `.env` file in the root folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer
PORT=3000
```

### Step 4 — Setup MySQL database

Login to MySQL:

```bash
mysql -u root -p
```

Run these commands:

```sql
CREATE DATABASE github_analyzer;
USE github_analyzer;
```

Then import the schema:

```bash
mysql -u root -p github_analyzer < schema.sql
```

### Step 5 — Run the server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:3000`

---

## Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto increment primary key |
| username | VARCHAR(100) | GitHub username (unique) |
| name | VARCHAR(200) | Display name |
| bio | TEXT | Profile bio |
| location | VARCHAR(200) | User location |
| avatar_url | TEXT | Profile picture URL |
| profile_url | TEXT | GitHub profile link |
| public_repos | INT | Number of public repositories |
| followers | INT | Follower count |
| following | INT | Following count |
| public_gists | INT | Number of public gists |
| top_language | VARCHAR(100) | Most used programming language |
| profile_score | INT | Calculated score (followers×2 + repos) |
| account_created_at | DATETIME | GitHub account creation date |
| github_updated_at | DATETIME | Last GitHub profile update |
| analyzed_at | TIMESTAMP | When first analyzed by this API |
| updated_at | TIMESTAMP | When last updated by this API |

---

## Profile Score Formula

```
profile_score = (followers × 2) + public_repos
```

Higher score = more influential profile. This allows profiles to be ranked by overall GitHub influence.

---

## Example Responses

### POST /api/analyze/torvalds

```json
{
  "message": "Profile of 'torvalds' analyzed and stored successfully",
  "profile": {
    "id": 1,
    "username": "torvalds",
    "name": "Linus Torvalds",
    "bio": "Just for fun",
    "location": "Portland, OR",
    "public_repos": 8,
    "followers": 236000,
    "following": 0,
    "top_language": "C",
    "profile_score": 472008,
    "analyzed_at": "2026-05-29T00:00:00.000Z"
  }
}
```

### GET /api/profiles

```json
{
  "message": "All analyzed profiles",
  "count": 2,
  "profiles": [
    {
      "username": "torvalds",
      "profile_score": 472008
    },
    {
      "username": "gaearon",
      "profile_score": 91034
    }
  ]
}
```

### GET /api/profiles/torvalds

```json
{
  "message": "Profile data for 'torvalds'",
  "profile": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "top_language": "C",
    "profile_score": 472008
  }
}
```

### Error — User not found

```json
{
  "error": "GitHub user 'invaliduser' not found"
}
```

---

## Project Structure

```
github-profile-analyzer/
├── src/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   └── profileController.js  # API logic
│   ├── routes/
│   │   └── profileRoutes.js      # Route definitions
│   └── index.js                  # App entry point
├── .env                          # Environment variables (not committed)
├── .gitignore
├── package.json
├── schema.sql                    # Database schema export
├── postman_collection.json       # Postman collection for testing
└── README.md
```

---

## Database Schema Export

The `schema.sql` file in the root folder contains the complete database schema. Import it using:

```bash
mysql -u root -p github_analyzer < schema.sql
```

---

## Author

Rudraksh Nautiyal B.Tech — CSE Jaypee University of Information Technology

