import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Load dataset
df = pd.read_csv("draac_dataset.csv")

# Features
X = df[
    [
        "unknown_device",
        "new_location",
        "suspicious_ip",
        "login_hour",
        "day_of_week"
    ]
].astype(int)

# Labels
y = df["is_suspicious"].astype(int)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Test model
predictions = model.predict(X_test)

print(classification_report(y_test, predictions))

# Save model
joblib.dump(model, "risk_model.pkl")

print("✅ Random Forest model trained successfully!")