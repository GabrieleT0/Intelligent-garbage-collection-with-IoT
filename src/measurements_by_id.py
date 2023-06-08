import boto3
import datetime
import random
import json
from boto3.dynamodb.conditions import Key, Attr


dynomdb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
table = dynomdb.Table('Bins_Salerno')

def handler(event, context):
#def test(id):
    payload = event.get('payload')
    id = payload['id']
    response = table.query(KeyConditionExpression=Key('device_id').eq(id),ScanIndexForward = False)

    return response['Items']

