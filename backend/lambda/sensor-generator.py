import json
import os
import random
from datetime import datetime, timezone

import boto3
from decimal import Decimal


dynamodb = boto3.resource("dynamodb")

READINGS_TABLE = os.environ.get("TABLE_NAME", "SmartCampusReadings")
LATEST_TABLE   = os.environ.get("LATEST_TABLE_NAME", "SmartCampusLatest")

readings_table = dynamodb.Table(READINGS_TABLE)
latest_table   = dynamodb.Table(LATEST_TABLE)


ROOMS = [
    # Floor 1
    {"roomId": "N-101",  "floor": 1, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-102",  "floor": 1, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-103",  "floor": 1, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-104",  "floor": 1, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-105",  "floor": 1, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-106",  "floor": 1, "roomType": "classroom",  "capacity": 80},
    # Floor 2
    {"roomId": "N-201",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-202",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-203",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-204",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-205",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-206",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-207",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-208",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-209",  "floor": 2, "roomType": "classroom",  "capacity": 80},
    # Floor 3
    {"roomId": "N-301",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-302",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-303",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-304",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-305",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-306",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-307",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-308",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-309",  "floor": 3, "roomType": "classroom",  "capacity": 80},
    # Floor 4 - classrooms
    {"roomId": "N-401",  "floor": 4, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-402",  "floor": 4, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-403",  "floor": 4, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-404",  "floor": 4, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-405",  "floor": 4, "roomType": "classroom",  "capacity": 80},
    {"roomId": "N-406",  "floor": 4, "roomType": "classroom",  "capacity": 80},
    # Floor 4 - labs
    {"roomId": "N-407A", "floor": 4, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-407B", "floor": 4, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-408A", "floor": 4, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-408B", "floor": 4, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-409A", "floor": 4, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-409B", "floor": 4, "roomType": "lab_small",  "capacity": 20},
    # Floor 5 - medium labs
    {"roomId": "N-501",  "floor": 5, "roomType": "lab_medium", "capacity": 40},
    {"roomId": "N-5011", "floor": 5, "roomType": "lab_medium", "capacity": 40},
    # Floor 5 - small labs
    {"roomId": "N-502",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-503",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-504",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-505",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
    # Floor 5 - N-506 big lab subdivisions
    {"roomId": "N-506-5061", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5062", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5063", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5064", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5065", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5066", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    {"roomId": "N-506-5067", "floor": 5, "roomType": "lab_small", "capacity": 20, "parentRoom": "N-506"},
    # Floor 5 - remaining small labs
    {"roomId": "N-507",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-508",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-509",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
    {"roomId": "N-510",  "floor": 5, "roomType": "lab_small",  "capacity": 20},
]


def generate_reading(room):
    capacity = room["capacity"]

    temperature = round(random.uniform(20.0, 35.0), 1)
    humidity    = random.randint(40, 70)
    co2         = random.randint(400, 700)
    occupancy   = random.randint(0, capacity)

    # ~6% chance of a spike on each metric to trigger alerts
    if random.random() < 0.06:
        temperature = round(random.uniform(40.1, 45.0), 1)
    if random.random() < 0.10:
        co2 = random.randint(901, 1200)
    if random.random() < 0.08:
        occupancy = min(occupancy + random.randint(1, 6), capacity + 5)

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

    # Build item — only include parentRoom if it exists (DynamoDB cannot store None/null)
    item = {
        "roomId":       room["roomId"],
        "timestamp":    now,
        "temperature":  Decimal(str(temperature)),
        "humidity":     Decimal(str(humidity)),
        "co2":          Decimal(str(co2)),
        "occupancy":    Decimal(str(occupancy)),
        "occupancyPct": Decimal(str(occupancy_pct)),
        "floor":        Decimal(str(room["floor"])),
        "alertFlags":   ",".join(alert_flags),
        "roomType":     room["roomType"],
        "capacity":     Decimal(str(capacity)),
    }

    if room.get("parentRoom"):
        item["parentRoom"] = room["parentRoom"]

    return item


def lambda_handler(event, context):
    readings = [generate_reading(room) for room in ROOMS]

    # Write all 53 readings to SmartCampusReadings (history, has sort key timestamp)
    with readings_table.batch_writer() as batch:
        for item in readings:
            batch.put_item(Item=item)

    # Upsert into SmartCampusLatest (no sort key — just overwrites previous latest)
    with latest_table.batch_writer() as batch:
        for item in readings:
            batch.put_item(Item=item)

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "message": "Sensor readings generated and written to both tables",
            "recordsWritten": len(readings),
            "readingsTable": READINGS_TABLE,
            "latestTable":   LATEST_TABLE,
            "generatedAt":   readings[0]["timestamp"] if readings else None,
        }),
    }