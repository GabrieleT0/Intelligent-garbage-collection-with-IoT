import boto3
import datetime
import random
import json
from boto3.dynamodb.conditions import Key, Attr


dynomdb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
table = dynomdb.Table('Bins_Salerno')
    
def handler(event, context):
#def test():

    #Scan for all items in the DB for find all device's id
    response = table.scan()
    data = response['Items']
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        data.extend(response['Items'])
    
    #Crete a list of device's ids
    items = response['Items']
    ids = []
    for item in items:
        print(item) 
        ids.append(int(item['device_id']))
    ids = list(dict.fromkeys(ids))
    ids.sort()

    #Get all the last IoT device measurements 
    last_measuremenst = []
    for id in ids:
        response = table.query(KeyConditionExpression=Key('device_id').eq(id),ScanIndexForward = False,Limit=1)
        print(response['Items'][0])
        last_measuremenst.append(response['Items'][0])
    
    response = {
        "isBase64Encoded": True,
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(last_measuremenst),
    }

    return response

    '''
    operation = event['operation']

    operations = {
        'create': ddb_create,
        'read': ddb_read,
        'update': ddb_update,
        'delete': ddb_delete,
        'echo': echo,
    }

    if operation in operations:
        return operations[operation](event.get('payload'))
    else:
        raise ValueError('Unrecognized operation "{}"'.format(operation))
    '''

'''
PAYLOAD EXAMPLE
{
    "operation": "echo",
    "payload": {
        "somekey1": "somevalue1",
        "somekey2": "somevalue2"
    }
}
'''
