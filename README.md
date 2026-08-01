# 🔐 Dynamic Risk Adaptive Access Control (DRAAC)

An AI-powered Zero Trust Adaptive Access Control system that continuously evaluates user risk based on device, location, IP address, and behavioral indicators. The system combines a rule-based risk engine with a Random Forest Machine Learning model to dynamically allow, restrict, or revoke user access in real time.

---

## 📌 Features

- ✅ User Registration & Authentication
- ✅ Rule-Based Risk Scoring
- ✅ Random Forest AI Risk Prediction
- ✅ Continuous Risk Monitoring (Every 5 Seconds)
- ✅ Adaptive Access Decisions
  - ALLOW
  - RESTRICT
  - REVOKE
- ✅ Temporary MFA Verification
- ✅ Automatic Verification Expiry
- ✅ Login & Security Event Logging
- ✅ PostgreSQL Database Integration
- ✅ REST APIs with FastAPI
- ✅ React Frontend Dashboard

---

## 🏗️ System Architecture

```
               +-----------------------+
               |    React Frontend     |
               +-----------+-----------+
                           |
                           |
                           ▼
                  FastAPI REST APIs
                           |
          +----------------+----------------+
          |                                 |
          ▼                                 ▼
 Rule-Based Risk Engine               Random Forest AI
          |                                 |
          +---------------+-----------------+
                          |
                          ▼
                Risk Evaluation Engine
                          |
                          ▼
         ALLOW / RESTRICT / REVOKE
                          |
                          ▼
                  PostgreSQL Database
                          |
                          ▼
           Continuous Monitoring Loop
                  (Every 5 Seconds)
```

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication

### Machine Learning
- Random Forest Classifier
- Pandas
- Scikit-learn
- Joblib

### Frontend
- React.js

### Database
- PostgreSQL

### Tools
- Swagger UI
- Git & GitHub
- VS Code

---

## 📂 Project Structure

```
DRAAC
│
├── main.py
├── database.py
├── models.py
├── train_model.py
├── export_dataset.py
├── requirements.txt
├── README.md
│
├── draac-frontend/
│
├── screenshots/
│
└── risk_model.pkl
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/tejashwinim12/Dynamic-Risk-Adaptive-Access-Control.git
```

Move into the project directory:

```bash
cd Dynamic-Risk-Adaptive-Access-Control
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🗄️ Configure PostgreSQL

Create a PostgreSQL database:

```
draac_db
```

Update your database connection string in `database.py`:

```python
DATABASE_URL = "postgresql+psycopg2://username:password@localhost:5432/draac_db"
```

---

## ▶️ Run the Backend

```bash
uvicorn main:app --reload
```

Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## 🤖 Train the AI Model

Export dataset:

```bash
python export_dataset.py
```

Train the Random Forest model:

```bash
python train_model.py
```

---

## 🔐 Authentication Flow

```
Login
   │
   ▼
Risk Evaluation
   │
   ▼
Rule Engine + AI
   │
   ▼
ALLOW
RESTRICT
REVOKE
```

If access is RESTRICT:

```
Protected Endpoint
        │
        ▼
403 Forbidden
        │
        ▼
Additional Verification
        │
        ▼
Temporary Access Granted
        │
        ▼
Verification Expires
        │
        ▼
Risk Re-evaluated
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Register user |
| POST | `/auth/login` | Authenticate user |
| POST | `/login` | User login & risk evaluation |
| PUT | `/update-context/{user_id}` | Update user context |
| GET | `/status/{user_id}` | Get user status |
| GET | `/logs/{user_id}` | Login history |
| GET | `/protected/{user_id}` | Protected resource |
| POST | `/verify/{user_id}` | Additional verification |
| POST | `/logout/{user_id}` | Logout |

---

## 🧠 Machine Learning Features

The Random Forest model evaluates:

- Unknown Device
- New Location
- Suspicious IP Address
- Login Hour
- Day of Week

The AI prediction is combined with the rule-based risk engine to make adaptive access decisions.

---

## 📊 Risk Levels

| Risk Score | Access Decision |
|------------|-----------------|
| 0 – 29     | ALLOW |
| 30 – 69    | RESTRICT |
| 70 – 100   | REVOKE |

---

## 📸 Screenshots

Add screenshots inside:

```
screenshots/
```

Suggested screenshots:

- Login (ALLOW)
- RESTRICT Response
- REVOKE Response
- Swagger UI
- Dashboard
- PostgreSQL Logs
- AI Prediction
- Protected API
- Verification API

---

## 🔮 Future Enhancements

- Email OTP Verification
- Google Authenticator Integration
- Device Fingerprinting
- Geofencing
- Behavioral Biometrics
- SIEM Integration
- Real-time Notifications
- Docker Deployment
- Kubernetes Deployment
- Cloud Deployment (AWS/Azure)

---

## 👩‍💻 Author

**Tejashwini M**

GitHub:
https://github.com/tejashwinim12

---

## 📜 License

This project is developed for educational and research purposes.