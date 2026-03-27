import boto3, json, os
from datetime import datetime, timezone, timedelta
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    room_id = event['pathParameters']['roomId']
    minutes = int((event.get('queryStringParameters') or {}).get('minutes', 30))
    
    now = datetime.now(timezone.utc)
    since = (now - timedelta(minutes=minutes)).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['READINGS_TABLE_NAME']) #READINGS_TABLE_NAME = SmartCampusReadings
    result = table.query(
        KeyConditionExpression=Key('roomId').eq(room_id) & Key('timestamp').gte(since)
    )
    items = sorted(result['Items'], key=lambda x: x['timestamp'])
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(items, default=str)
    }