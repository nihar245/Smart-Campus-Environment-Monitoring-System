# Lambda Sensor Generator

This folder contains a simple AWS Lambda generator for random sensor values.

## File

- `function.py`: Generates 53 room readings and writes them to DynamoDB.

## Required environment variable

- `TABLE_NAME`: DynamoDB table name for sensor records.

## Suggested DynamoDB key schema

- Partition key: `roomId` (String)
- Sort key: `timestamp` (String, ISO-8601 UTC)

## Lambda runtime

- Python 3.11 (or compatible)

## Trigger

Use EventBridge Scheduler with a 30-second or 1-minute schedule (minimum native schedule is 1 minute; for 30 seconds you typically use an alternate mechanism).

## Notes

- Alert flags generated: `TEMP_HIGH`, `CO2_HIGH`, `OCCUPANCY_FULL`, `OCCUPANCY_WARN`
- `occupancyPct` is precomputed for frontend usage.
