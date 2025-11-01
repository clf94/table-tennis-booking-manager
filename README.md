## ⚙️ Prerequisites

- **Docker** and **Docker Compose** installed
- Optional: **Python 3.11+** and **Node 18+** if you want to run each part separately

---

## 🐳 Building and Running with Docker

### 1️⃣ Build the image
```bash
docker build -t tabletennis-app .
docker run -p 5008:5008 tabletennis-app
```


## Access the app
Open your browser at http://localhost:5008

The frontend is served directly by Flask

API routes are available under /api/..., e.g.:
