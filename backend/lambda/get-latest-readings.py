import boto3, json, os

def lambda_handler(event, context):
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['LATEST_TABLE_NAME']) #LATEST_TABLE_NAME = SmartCampusLatest
    result = table.scan()
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(result['Items'], default=str)
    }