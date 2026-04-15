import importlib.util
import json
import subprocess
import sys
from datetime import datetime


def ensure_python_dependencies():
    required_packages = [
        ("flask", "Flask"),
        ("flask_cors", "Flask-CORS"),
        ("psycopg2", "psycopg2-binary"),
        ("dotenv", "python-dotenv"),
    ]
    missing = [pip_name for module_name, pip_name in required_packages if importlib.util.find_spec(module_name) is None]
    if missing:
        subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])


ensure_python_dependencies()

import psycopg2
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

from config import DATABASE_URL
from utils import normalize_severity, parse_csv_param

app = Flask(
    __name__,
    template_folder="../frontend",
    static_folder="../static",
    static_url_path="/static",
)
CORS(app)


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


def build_filters(start_date, end_date, severity_values, cause_values):
    where_parts = ["1=1"]
    params = []

    if start_date:
        where_parts.append("date_detected >= %s")
        params.append(start_date)
    if end_date:
        where_parts.append("date_detected <= %s")
        params.append(end_date)
    if severity_values:
        where_parts.append("LOWER(severity) = ANY(%s)")
        params.append(severity_values)
    if cause_values:
        where_parts.append("likely_cause = ANY(%s)")
        params.append(cause_values)

    return " AND ".join(where_parts), params


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"})


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    severity = normalize_severity(parse_csv_param(request.args.get("severity")))
    cause = parse_csv_param(request.args.get("cause"))

    where_clause, params = build_filters(start_date, end_date, severity, cause)

    sql = f"""
        SELECT
            alert_id,
            date_detected,
            severity,
            likely_cause,
            confidence_score,
            area_ha,
            shape_index,
            pre_ndvi,
            detection_method,
            ST_AsGeoJSON(geom) AS geojson
        FROM alerts
        WHERE {where_clause}
        ORDER BY date_detected DESC
    """

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(sql, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    features = []
    for row in rows:
        features.append(
            {
                "type": "Feature",
                "geometry": json.loads(row[9]),
                "properties": {
                    "alert_id": row[0],
                    "date_detected": row[1].isoformat() if row[1] else None,
                    "severity": row[2],
                    "likely_cause": row[3],
                    "confidence_score": float(row[4]) if row[4] is not None else 0.0,
                    "area_ha": float(row[5]) if row[5] is not None else 0.0,
                    "shape_index": float(row[6]) if row[6] is not None else None,
                    "pre_ndvi": float(row[7]) if row[7] is not None else None,
                    "detection_method": row[8],
                },
            }
        )

    return jsonify({"type": "FeatureCollection", "features": features})


@app.route("/api/summary", methods=["GET"])
def get_summary():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    severity = normalize_severity(parse_csv_param(request.args.get("severity")))
    cause = parse_csv_param(request.args.get("cause"))

    where_clause, params = build_filters(start_date, end_date, severity, cause)

    sql = f"""
        SELECT
            COUNT(*) AS total_alerts,
            COALESCE(SUM(area_ha), 0) AS total_area_ha,
            COALESCE(AVG(confidence_score), 0) AS avg_confidence
        FROM alerts
        WHERE {where_clause}
    """

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(sql, params)
    row = cur.fetchone()
    cur.close()
    conn.close()

    return jsonify(
        {
            "total_alerts": int(row[0]) if row else 0,
            "total_area_ha": float(row[1]) if row and row[1] is not None else 0.0,
            "avg_confidence": float(row[2]) if row and row[2] is not None else 0.0,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
