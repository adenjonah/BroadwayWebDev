"""Flask server for the scrape worker. Receives job triggers from the admin API."""

import os
import threading

from flask import Flask, request, jsonify

from run_job import execute_job

app = Flask(__name__)

# Track active jobs so we can report health accurately
_active_jobs: set[str] = set()
_lock = threading.Lock()


def _run_in_background(job_id: str) -> None:
    with _lock:
        _active_jobs.add(job_id)
    try:
        execute_job(job_id)
    finally:
        with _lock:
            _active_jobs.discard(job_id)


@app.route("/run", methods=["POST"])
def run_job():
    data = request.get_json(silent=True) or {}
    auth_token = data.get("auth_token", "")
    job_id = data.get("job_id", "")

    expected_token = os.environ.get("WORKER_AUTH_TOKEN", "")
    if not expected_token or auth_token != expected_token:
        return jsonify({"error": "Unauthorized"}), 401

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    thread = threading.Thread(target=_run_in_background, args=(job_id,), daemon=True)
    thread.start()

    return jsonify({"status": "accepted", "job_id": job_id}), 202


@app.route("/health", methods=["GET"])
def health():
    with _lock:
        active = len(_active_jobs)
    return jsonify({"status": "ok", "active_jobs": active}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, threaded=True)
