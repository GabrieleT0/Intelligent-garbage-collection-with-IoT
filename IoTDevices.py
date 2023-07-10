import boto3
import datetime
import random
import json

FAILURE_RATE = 0.08

#def lambda_handler(event,context):
def test():
    sqs = boto3.resource('sqs', endpoint_url='http://localhost:4566')
    sns_client = boto3.client('sns',endpoint_url='http://localhost:4566')
    topicArn = 'arn:aws:sns:us-east-1:000000000000:sensor_error'
    
    #load info of our simulated IoT device from a JSON file
    with open('IoTDevices_info.json','r') as f:
        iot_devices = json.load(f)

    queue = sqs.get_queue_by_name(QueueName='Bins_Salerno')

    for device in iot_devices:
        measure_date = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        lat = device['latitude']
        long = device['longitude']
        if random.random() < FAILURE_RATE:
            device_id = device['device_id']
            error_message = '{"device_id": "%d","error_date": "%s","latitude": "%s","longitude": "%s"}' % (device_id,measure_date,lat,long)
            sns_client.publish(TopicArn=topicArn,Message=error_message,Subject='ERROR')
            print('IoT device error')
        else:
            kg = round(random.uniform(0.0,50.50),2)
            device_id = device['device_id']
            msg_body = '{"device_id": "%d","measure_date": "%s","latitude": "%s","longitude": "%s","kilograms": "%s"}' % (device_id,measure_date,lat,long,kg)
            queue.send_message(MessageBody=msg_body)

test()