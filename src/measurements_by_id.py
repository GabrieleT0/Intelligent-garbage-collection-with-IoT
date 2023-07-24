import boto3
import json
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    dynomdb = boto3.resource('dynamodb', endpoint_url="http://host.docker.internal:4566")
    table = dynomdb.Table('Bins_Salerno')

    body = json.loads(event['body'])
    payload = body['payload']
    id = payload['id']
    
    result = table.query(KeyConditionExpression=Key('device_id').eq(int(id)),ScanIndexForward = False)

    items = result['Items']
    for item in items:
        device_id = str(item['device_id'])
        item['device_id'] = device_id

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