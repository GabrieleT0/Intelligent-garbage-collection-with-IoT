import boto3
import datetime
import random
import json
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
#def test(id):
    dynomdb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
    table = dynomdb.Table('Bins_Salerno')
    
    payload = event.get('payload')
    id = payload['id']
    
    result = table.query(KeyConditionExpression=Key('device_id').eq(id),ScanIndexForward = False)

    response = {
        "isBase64Encoded": False,
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result['Items']),
    }

    return response

