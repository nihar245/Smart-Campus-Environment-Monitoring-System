import boto3, json

def lambda_handler(event, context):
    db = boto3.resource('dynamodb', region_name='us-east-1')
    table = db.Table('SmartCampusRooms')

    rooms = [
        # Floor 1 - classrooms
        {"roomId":"N-101","floor":1,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-101"},
        {"roomId":"N-102","floor":1,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-102"},
        {"roomId":"N-103","floor":1,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-103"},
        {"roomId":"N-104","floor":1,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-104"},
        {"roomId":"N-105","floor":1,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-105"},
        {"roomId":"N-106","floor":1,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-106"},
        # Floor 2 - classrooms
        {"roomId":"N-201","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-201"},
        {"roomId":"N-202","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-202"},
        {"roomId":"N-203","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-203"},
        {"roomId":"N-204","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-204"},
        {"roomId":"N-205","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-205"},
        {"roomId":"N-206","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-206"},
        {"roomId":"N-207","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-207"},
        {"roomId":"N-208","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-208"},
        {"roomId":"N-209","floor":2,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-209"},
        # Floor 3 - classrooms
        {"roomId":"N-301","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-301"},
        {"roomId":"N-302","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-302"},
        {"roomId":"N-303","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-303"},
        {"roomId":"N-304","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-304"},
        {"roomId":"N-305","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-305"},
        {"roomId":"N-306","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-306"},
        {"roomId":"N-307","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-307"},
        {"roomId":"N-308","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-308"},
        {"roomId":"N-309","floor":3,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-309"},
        # Floor 4 - classrooms
        {"roomId":"N-401","floor":4,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-401"},
        {"roomId":"N-402","floor":4,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-402"},
        {"roomId":"N-403","floor":4,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-403"},
        {"roomId":"N-404","floor":4,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-404"},
        {"roomId":"N-405","floor":4,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-405"},
        {"roomId":"N-406","floor":4,"roomType":"classroom","capacity":80,"parentRoom":None,"displayName":"Classroom N-406"},
        # Floor 4 - labs
        {"roomId":"N-407A","floor":4,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-407A"},
        {"roomId":"N-407B","floor":4,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-407B"},
        {"roomId":"N-408A","floor":4,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-408A"},
        {"roomId":"N-408B","floor":4,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-408B"},
        {"roomId":"N-409A","floor":4,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-409A"},
        {"roomId":"N-409B","floor":4,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-409B"},
        # Floor 5 - small labs
        {"roomId":"N-501","floor":5,"roomType":"lab_medium","capacity":40,"parentRoom":None,"displayName":"Lab N-501"},
        {"roomId":"N-502","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-502"},
        {"roomId":"N-503","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-503"},
        {"roomId":"N-504","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-504"},
        {"roomId":"N-505","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-505"},
        # Floor 5 - N-506 big lab subdivisions
        {"roomId":"N-506-5061","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":"N-506","displayName":"Lab N-506 / Bay 1"},
        {"roomId":"N-506-5062","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":"N-506","displayName":"Lab N-506 / Bay 2"},
        {"roomId":"N-506-5063","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":"N-506","displayName":"Lab N-506 / Bay 3"},
        {"roomId":"N-506-5064","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":"N-506","displayName":"Lab N-506 / Bay 4"},
        {"roomId":"N-506-5065","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":"N-506","displayName":"Lab N-506 / Bay 5"},
        {"roomId":"N-506-5066","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":"N-506","displayName":"Lab N-506 / Bay 6"},
        {"roomId":"N-506-5067","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":"N-506","displayName":"Lab N-506 / Bay 7"},
        # Floor 5 - remaining small labs
        {"roomId":"N-5011","floor":5,"roomType":"lab_medium","capacity":40,"parentRoom":None,"displayName":"Lab N-5011"},
        {"roomId":"N-507","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-507"},
        {"roomId":"N-508","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-508"},
        {"roomId":"N-509","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-509"},
        {"roomId":"N-510","floor":5,"roomType":"lab_small","capacity":20,"parentRoom":None,"displayName":"Lab N-510"},
    ]

    with table.batch_writer() as batch:
        for room in rooms:
            # DynamoDB doesn't store None — remove null fields
            item = {k: v for k, v in room.items() if v is not None}
            item['floor'] = int(item['floor'])
            item['capacity'] = int(item['capacity'])
            batch.put_item(Item=item)

    return {"statusCode": 200, "body": f"Seeded {len(rooms)} rooms"}