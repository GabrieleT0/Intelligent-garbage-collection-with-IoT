import boto3
import datetime
import json

EMPTY = 2.0
LOW = 10.0
MEDIUM = 25.00
HIGH = 45.00

#def lambda_handler(event, contex):
def test():
    sqs = boto3.resource('sqs', endpoint_url='http://localhost:4566')
    dynomdb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")

    table = dynomdb.Table('Bins_Salerno')

    queue = sqs.get_queue_by_name(QueueName='Bins_Salerno')
    messages = []
    while True:
        response = queue.receive_messages(MaxNumberOfMessages=10, VisibilityTimeout=10, WaitTimeSeconds=10)
        if response:
            messages.extend(response)
        for message in messages:
            content = json.loads(message.body)
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
            message.delete()
        else:
            break

test()