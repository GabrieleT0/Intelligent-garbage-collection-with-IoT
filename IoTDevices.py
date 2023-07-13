import boto3
import datetime
import random
import json
import os

FAILURE_RATE = 0.08

def lambda_handler(event,context):
    endpoint_url = f'http://{os.environ.get("LOCALSTACK_HOSTNAME")}:{os.environ.get("EDGE_PORT")}'
    sqs = boto3.resource('sqs', endpoint_url=endpoint_url)
    sns_client = boto3.client('sns',endpoint_url=endpoint_url)
    topicArn = 'arn:aws:sns:us-east-1:000000000000:sensor_error'
    
    #load info of our simulated IoT device from a JSON file stored in a S3 Bucket
    s3 = boto3.resource('s3', endpoint_url=endpoint_url)
    bucket = s3.Bucket('iot-devices-metadata')
    object = bucket.Object('iot_devices')
    file_content = object.get()['Body'].read().decode('utf-8')
    iot_devices = json.loads(file_content)

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
            distance = round(random.uniform(0.0,120.00),2)
            device_id = device['device_id']
            msg_body = '{"device_id": "%d","measure_date": "%s","latitude": "%s","longitude": "%s","distance(cm)": "%s"}' % (device_id,measure_date,lat,long,distance)
            queue.send_message(MessageBody=msg_body)
