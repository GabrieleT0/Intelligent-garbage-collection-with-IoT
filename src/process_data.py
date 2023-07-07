import boto3
import datetime
import json
import os

EMPTY = 2.0
LOW = 10.0
MEDIUM = 25.00
HIGH = 45.00

def lambda_handler(event, contex):
    endpoint_url = f'http://{os.environ.get("LOCALSTACK_HOSTNAME")}:{os.environ.get("EDGE_PORT")}'
    
    dynomdb = boto3.resource('dynamodb', endpoint_url=endpoint_url)

    table = dynomdb.Table('Bins_Salerno')

    records = event['Records']
    for record in records:
        message = record['body']

        content = json.loads(message)
        kg = float(content['kilograms'])
        if(kg <= EMPTY):
            level = 'EMPTY'
        if(kg <= LOW):
            level = 'LOW'
        elif(kg <= MEDIUM):
            level = 'MEDIUM'
        elif(kg <= HIGH):
            level = 'HIGH'
        else:
            level = 'TO BE EMPTIED'

        item = {
            'device_id': int(content['device_id']),
            'latitude': content['latitude'],
            'longitude': content['longitude'],
            'trash_level': level,
            'measure_date': content['measure_date']
        }

        table.put_item(Item=item)