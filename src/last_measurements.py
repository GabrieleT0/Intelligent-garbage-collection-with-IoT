import boto3
import datetime
import random
import json
from boto3.dynamodb.conditions import Key, Attr
import os
def lambda_handler(event, context):
    endpoint_url = f'http://{os.environ.get("LOCALSTACK_HOSTNAME")}:{os.environ.get("EDGE_PORT")}'
    dynomdb = boto3.resource('dynamodb', endpoint_url=endpoint_url)
    table = dynomdb.Table('Bins_Salerno')

    #load info of our simulated IoT device from a JSON file stored in a S3 Bucket
    s3 = boto3.resource('s3', endpoint_url=endpoint_url)
    bucket = s3.Bucket('iot-devices-metadata')
    object = bucket.Object('iot_devices')
    file_content = object.get()['Body'].read().decode('utf-8')
    iot_devices = json.loads(file_content)

    ids = []
    for device in iot_devices:
        ids.append(device["device_id"])

    #Get all the last IoT device measurements 
    last_measuremenst = []
    for id in ids:
        try:
            response = table.query(KeyConditionExpression=Key('device_id').eq(id),ScanIndexForward = False,Limit=1)
            device_id = str(response['Items'][0]['device_id'])
            response['Items'][0]['device_id'] = device_id
            
            last_measuremenst.append(response['Items'][0])
        except IndexError as e: #it may happen that a device with a specific id fails and has no value in the db
            continue 

    response = {
        "isBase64Encoded": False,
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(last_measuremenst),
    }

    return response