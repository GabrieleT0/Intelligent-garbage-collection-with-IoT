import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")

table = dynamodb.create_table(
    TableName='Bins_Salerno',
    KeySchema=[
        {
            'AttributeName': 'device_id',
            'KeyType': 'HASH'
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'device_id',
            'AttributeType': 'N'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 10,
        'WriteCapacityUnits': 10
    }
)