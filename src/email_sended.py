import urllib3
import json

def lambda_handler(event, context):
    http = urllib3.PoolManager()
    r = http.request('GET','http://host.docker.internal:4566/_aws/ses')
    response_ses = json.loads(r.data)
    print(response_ses)
    response = {
        "isBase64Encoded": False,
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': response_ses,
    }

    return response