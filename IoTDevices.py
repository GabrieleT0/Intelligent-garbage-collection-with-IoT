import boto3
import datetime
import random
import json

FAILURE_RATE = 0.08

def lambda_handler(event,context):
    sqs = boto3.resource('sqs', endpoint_url='http://localhost:4566')

    #load info of our simulated IoT device from a JSON file
    with open('IoTDevices_info.json','r') as f:
        iot_devices = json.load(f)

    queue = sqs.get_queue_by_name(QueueName='Bins_Salerno')

    for device in iot_devices:
        measure_date = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        if random.random() < FAILURE_RATE:
            #TODO: send failure message to AWS-SNS
            print('IoT device error')
        else:
            kg = round(random.uniform(0.0,50.50),2)
            device_id = device['device_id']
            lat = device['latitude']
            long = device['longitude']
            msg_body = '{"device_id: "%s","measure_date":"%s","latitude": "%s","longitude: "%s", "kilograms": "%s""}' % (device_id,measure_date,lat,long,kg)
            queue.send_message(MesageBody=msg_body)