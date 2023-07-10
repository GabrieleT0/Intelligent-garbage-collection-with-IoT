import boto3
from botocore.exceptions import ClientError
import os
import json

def lambda_handler(event, context):
    endpoint_url = f'http://{os.environ.get("LOCALSTACK_HOSTNAME")}:{os.environ.get("EDGE_PORT")}'

    # Create a new SES resource and specify a region.
    client = boto3.client('ses',endpoint_url=endpoint_url)
    
    sender = "sensor.error@iotgarbagecollection.com"
    
    recipient = "admin@iotgarbagecollection.com"

    subject = "The IoT sensor produced an error"

    
    sns_message_payload = event["Records"][0]["Sns"]
    sns_message_headers = {
        "x-amz-sns-message-id": sns_message_payload['MessageId'],
        "x-amz-sns-message-type": sns_message_payload["Type"],
        "x-amz-sns-subscription-arn" : event["Records"][0]["EventSubscriptionArn"],
        "x-amz-sns-topic-arn" : sns_message_payload["TopicArn"]
    }

    message = sns_message_payload['Message']
    message = json.loads(message)

    email_text = f"Oh no! The IoT device with id {message['device_id']}, located at {message['latitude']}, {message['longitude']} failed to measure."

    body_text = (email_text)

    body_html = f"""<html>
        <head></head>
        <body>
        <h1>The IoT sensor produced an error</h1>
        <p>{email_text}</p>
        </body>
        </html>"""

    charset = "UTF-8"

    try:
        response = client.send_email(
            Destination={
                'ToAddresses': [
                    recipient
                ]
            },
            Message={
                'Body':{
                    'Html': {
                        'Charset': charset,
                        'Data': body_html,
                    },
                    'Text': {
                        'Charset': charset,
                        'Data': body_text
                    },
                },
                'Subject': {
                    'Charset': charset,
                    'Data': subject,
                },
            },
            Source=sender,
        )
    except ClientError as e:
        print(e.response['Error']['Message'])