#mkdir custom_files
#wget -O custom_files/italy-sud-latest.osm.pbf https://download.geofabrik.de/europe/italy/sud-latest.osm.pbf
#Create SQS
aws sqs create-queue --queue-name Bins_Salerno --endpoint-url=http://localhost:4566
#Create SNS
output=$(aws sns create-topic --name sensor_error --endpoint-url=http://localhost:4566)
TOPIC_ARN=$(echo "$output" | jq -r '.TopicArn')
echo 'TOPIC_ARN:'$TOPIC_ARN

aws sns set-topic-attributes --topic-arn $TOPIC_ARN --attribute-name sensors_error --attribute-value sensors_error --endpoint-url=http://localhost:4566

#Example of a topic HTTP endpoint subscription
aws sns subscribe --topic-arn $TOPIC_ARN --protocol http --notification-endpoint http://host.docker.internal:5000 --endpoint-url=http://localhost:4566

#Verify the email to enable the ses to send email with the address
aws ses verify-email-identity --email-address sensor.error@iotgarbagecollection.com --endpoint-url http://localhost:4566

aws s3api create-bucket --bucket iot-devices-metadata --endpoint-url http://localhost:4566
aws s3api put-object --bucket iot-devices-metadata --key iot_devices --body IoTDevices_info.json --endpoint-url http://localhost:4566

aws dynamodb create-table \
    --table-name Bins_Salerno \
    --key-schema \
        AttributeName=device_id,KeyType=HASH \
        AttributeName=measure_date,KeyType=RANGE \
    --attribute-definitions \
        AttributeName=device_id,AttributeType=N \
        AttributeName=measure_date,AttributeType=S\
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=10 \
    --table-class STANDARD \
    --endpoint-url http://localhost:4566 >/dev/null

zip iotDevices.zip IoTDevices.py
aws lambda create-function \
    --function-name iot_devices_lambda \
    --runtime python3.8 \
    --handler IoTDevices.lambda_handler\
    --memory-size 128 \
    --zip-file fileb://iotDevices.zip \
    --role arn:aws:iam::111111111111:role/apigw \
    --timeout 600 \
    --endpoint-url http://localhost:4566 >/dev/null

aws events put-rule \
    --name my-scheduled-rule \
    --schedule-expression 'rate(10 minutes)'\
    --endpoint-url http://localhost:4566 >/dev/null

aws lambda add-permission \
    --function-name iot_devices_lambda \
    --statement-id my-scheduled-event \
    --action 'lambda:InvokeFunction' \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:us-east-1:000000000000:rule/my-scheduled-rule\
    --endpoint-url http://localhost:4566 >/dev/null

aws events put-targets --rule my-scheduled-rule --targets file://targets.json --endpoint-url http://localhost:4566

cd src/
#python create_table.py
sh deploy_APIG_lambda.sh