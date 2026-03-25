import json
import os
import random
from datetime import datetime, timezone

import boto3


dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("TABLE_NAME", "smart-campus-readings")
table = dynamodb.Table(TABLE_NAME)


ROOMS = [
    # Floor 1
    {"roomId": "N-101", "floor": 1, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-102", "floor": 1, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-103", "floor": 1, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-104", "floor": 1, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-105", "floor": 1, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-106", "floor": 1, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    # Floor 2
    {"roomId": "N-201", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-202", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-203", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-204", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-205", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-206", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-207", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-208", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-209", "floor": 2, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    # Floor 3
    {"roomId": "N-301", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-302", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-303", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-304", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-305", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-306", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-307", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-308", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-309", "floor": 3, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    # Floor 4
    {"roomId": "N-401", "floor": 4, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-402", "floor": 4, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-403", "floor": 4, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-404", "floor": 4, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-405", "floor": 4, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-406", "floor": 4, "roomType": "classroom", "capacity": 80, "parentRoom": None},
    {"roomId": "N-407A", "floor": 4, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-407B", "floor": 4, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-408A", "floor": 4, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-408B", "floor": 4, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-409A", "floor": 4, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-409B", "floor": 4, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    # Floor 5
    {"roomId": "N-501", "floor": 5, "roomType": "lab_medium", "capacity": 40, "parentRoom": None},
    {"roomId": "N-5011", "floor": 5, "roomType": "lab_medium", "capacity": 40, "parentRoom": None},
    {"roomId": "N-502", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-503", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-504", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-505", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-507", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-508", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-509", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-510", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": None},
    {"roomId": "N-506-5061", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5062", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5063", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5064", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5065", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5066", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5067", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
]


def generate_reading(room):
    """Generate one random sensor record with occasional spikes for alerts."""
    capacity = room["capacity"]

    # Normal ranges from your context
    temperature = round(random.uniform(20.0, 35.0), 1)
    humidity = random.randint(40, 70)
    co2 = random.randint(400, 700)

    # Occupancy profile by room type
    if room["roomType"] == "classroom":
        occupancy = random.randint(0, 80)
    elif room["roomType"] == "lab_medium":
        occupancy = random.randint(0, 40)
    else:
        occupancy = random.randint(0, 20)

    # Rare outliers to trigger alerts
    if random.random() < 0.06:
        temperature = round(random.uniform(40.1, 45.0), 1)
    if random.random() < 0.10:
        co2 = random.randint(901, 1200)
    if random.random() < 0.08:
        occupancy = min(capacity + random.randint(1, 6), capacity + 10)

    occupancy_pct = round((occupancy / capacity) * 100, 1)

    alert_flags = []
    if temperature > 40:
        alert_flags.append("TEMP_HIGH")
    if co2 > 900:
        alert_flags.append("CO2_HIGH")
    if occupancy_pct >= 100:
        alert_flags.append("OCCUPANCY_FULL")
    elif occupancy_pct >= 80:
        alert_flags.append("OCCUPANCY_WARN")

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    return {
        "roomId": room["roomId"],
        "timestamp": now,
        "temperature": temperature,
        "humidity": humidity,
        "co2": co2,
        "occupancy": occupancy,
        "occupancyPct": occupancy_pct,
        "floor": room["floor"],
        "alertFlags": ",".join(alert_flags),
        "roomType": room["roomType"],
        "capacity": capacity,
        "parentRoom": room["parentRoom"],
    }


def write_readings_batch(items):
    """Use a batch writer for efficient DynamoDB writes."""
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)


def lambda_handler(event, context):
    readings = [generate_reading(room) for room in ROOMS]
    write_readings_batch(readings)

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(
            {
                "message": "Sensor readings generated",
                "table": TABLE_NAME,
                "recordsWritten": len(readings),
                "generatedAt": readings[0]["timestamp"] if readings else None,
            }
        ),
    }


if __name__ == "__main__":
    # Local smoke test: prints one sample payload without writing to DynamoDB.
    sample = generate_reading(ROOMS[0])
    print(json.dumps(sample, indent=2))
