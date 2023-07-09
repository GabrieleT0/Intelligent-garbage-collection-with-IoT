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

cd src/
python create_table.py
sh deploy_APIG_lambda.sh
cd ..
python IoTDevices.py