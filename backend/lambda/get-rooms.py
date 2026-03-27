import boto3, json, os

def lambda_handler(event, context):
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['ROOMS_TABLE_NAME']) #ROOMS_TABLE_NAME = SmartCampusRooms
    result = table.scan()
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(result['Items'], default=str)
    }
