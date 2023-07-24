import boto3
import json
import os

EMPTY = 110
LOW = 90
MEDIUM = 60
HIGH = 30
VERY_HIGH = 15

def lambda_handler(event, contex):
    endpoint_url = f'http://{os.environ.get("LOCALSTACK_HOSTNAME")}:{os.environ.get("EDGE_PORT")}'
    
    dynomdb = boto3.resource('dynamodb', endpoint_url=endpoint_url)

    table = dynomdb.Table('Bins_Salerno')

    records = event['Records']
    for record in records:
        message = record['body']

        content = json.loads(message)
        distance = float(content['distance(cm)'])
        if(distance >= EMPTY):
            level = 'EMPTY'
        elif(distance >= LOW):
            level = 'LOW'
        elif(distance >= MEDIUM):
            level = 'MEDIUM'
        elif(distance >= HIGH):
            level = 'HIGH'
        else:
            level = 'TO BE EMPTIED'

        item = {
            'device_id': int(content['device_id']),
            'latitude': content['latitude'],
            'longitude': content['longitude'],
            'trash_level': level,
            'distance(cm)': str(distance),
            'measure_date': content['measure_date']
        }

        table.put_item(Item=item)