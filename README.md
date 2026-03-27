# Smart Campus Environment Monitoring System

Cloud computing assignment project for monitoring environmental conditions in N Block (53 spaces) using a serverless AWS backend and a React frontend dashboard.

## Assignment Objective

This project demonstrates an end-to-end cloud-native architecture:

1. Data generation using AWS Lambda
2. Data persistence using DynamoDB
3. API exposure using API Gateway + Lambda integrations
4. Scheduled automation using EventBridge
5. Frontend hosting using Amazon S3 static website hosting

The frontend provides live monitoring, alerts, trends, and a 3D building map, while the backend showcases core AWS serverless patterns expected in a Cloud Computing subject.

## Key Features

1. Live room-level readings (temperature, humidity, CO2, occupancy)
2. Building-wide alert detection and severity display
3. Floor-wise room dashboard and summary analytics
4. Historical trend visualization per room
5. Interactive 3D N Block sensor map
6. Fully serverless data pipeline on AWS

## AWS-Centric Architecture

High-level flow:

1. EventBridge schedule triggers sensor-generator Lambda
2. Generator Lambda writes synthetic readings to DynamoDB
3. API Gateway routes requests to read-focused Lambda functions
4. Lambda APIs read DynamoDB and return JSON to frontend
5. React app fetches data and renders dashboard + 3D map

Services used:

1. AWS Lambda (compute)
2. Amazon DynamoDB (NoSQL data store)
3. Amazon API Gateway (REST endpoints)
4. Amazon EventBridge Scheduler (periodic invocation)
5. Amazon CloudWatch Logs (observability)
6. Amazon S3 (frontend hosting)
7. IAM Roles/Policies (security and permissions)

## Lambda Functions (Primary Focus)

This project is designed around Lambda-first backend execution.

### 1) sensor-generator Lambda

Location: backend/lambda/function.py

Responsibility:

1. Generate sensor values for all monitored rooms
2. Produce alert flags based on thresholds
3. Write timestamped records to DynamoDB

Input:

1. Triggered by EventBridge schedule
2. Optional test event payload (empty JSON works)

Output:

1. New reading records in readings table
2. CloudWatch execution logs

Important environment variable:

1. TABLE_NAME (target DynamoDB table)

Alert flags generated:

1. TEMP_HIGH
2. CO2_HIGH
3. OCCUPANCY_FULL
4. OCCUPANCY_WARN

### 2) API Lambda: get-latest-readings

Responsibility:

1. Return the latest reading for each room
2. Power the main dashboard live cards

Expected endpoint:

1. GET /readings/latest

### 3) API Lambda: get-room-history

Responsibility:

1. Return room-specific time-series data
2. Support frontend chart history window

Expected endpoint:

1. GET /readings/room/{roomId}?minutes=30

### 4) API Lambda: get-rooms

Responsibility:

1. Return room metadata (roomId, floor, labels, etc.)
2. Keep frontend layout and filtering consistent

Expected endpoint:

1. GET /rooms

## DynamoDB Design

Recommended tables:

1. SmartCampusReadings
2. SmartCampusLatest
3. SmartCampusRooms

Suggested keys:

1. Readings table PK: roomId (String)
2. Readings table SK: timestamp (ISO-8601 String)

Why this matters:

1. Efficient partitioned history queries by room
2. Fast latest-read dashboard fetch path
3. Clear separation of telemetry vs metadata

## API Contract Used By Frontend

The frontend expects these routes:

1. GET /readings/latest
2. GET /rooms
3. GET /readings/room/{roomId}?minutes=30

Base URL comes from environment:

1. VITE_API_URL
2. REACT_APP_API_URL (compatibility)

## Frontend Stack

1. React + Vite
2. React Router
3. Recharts
4. Three.js via @react-three/fiber and @react-three/drei

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create/update .env from .env.example and set API base URL:

```env
VITE_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com/prod
```

3. Run dev server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

## AWS Deployment (Recommended Order)

1. Create DynamoDB tables
2. Create Lambda IAM role with DynamoDB + CloudWatch permissions
3. Deploy sensor-generator Lambda
4. Seed SmartCampusRooms metadata
5. Deploy API Lambda functions
6. Configure API Gateway resources and methods
7. Create EventBridge schedule for generator Lambda
8. Set frontend VITE_API_URL
9. Build and upload dist to S3 static hosting
10. Validate all API endpoints from browser/Postman

Detailed step-by-step guide is available in aws.md.

## Observability and Validation

CloudWatch checks:

1. Generator invocation frequency and success logs
2. API Lambda errors and latency
3. Throttling/timeouts if traffic increases

End-to-end checks:

1. /rooms returns all configured spaces
2. /readings/latest returns current values
3. /readings/room/<id> returns time-series history
4. Dashboard + 3D map reflect live updates

## Security and Best Practices

1. Avoid wildcard IAM permissions in final submission
2. Restrict policies to exact DynamoDB table ARNs
3. Enable API Gateway CORS correctly
4. Add CloudWatch alarms for Lambda failures
5. Use AWS Budgets alerts for cost control

## Repository Structure

1. src/: React frontend (dashboard, map, charts, alerts)
2. backend/lambda/function.py: sensor-generator Lambda code
3. backend/lambda/README.md: generator-specific notes
4. aws.md: full AWS setup guide from scratch

## Cloud Computing Learning Outcomes Covered

1. Serverless function design with AWS Lambda
2. Event-driven scheduling with EventBridge
3. Managed NoSQL storage with DynamoDB
4. REST API exposure with API Gateway
5. IAM-based access control and least privilege principles
6. Monitoring and debugging with CloudWatch
7. Static web hosting on AWS S3