zip function.zip last_measurements.py
aws lambda create-function \
    --function-name apigw-lambda \
    --runtime python3.8 \
    --handler last_measurements.lambda_handler\
    --memory-size 128 \
    --zip-file fileb://function.zip \
    --role arn:aws:iam::111111111111:role/apigw \
    --endpoint-url http://localhost:4566 >/dev/null

zip function2.zip measurements_by_id.py
aws lambda create-function \
    --function-name apigw-lambda2 \
    --runtime python3.8 \
    --handler measurements_by_id.lambda_handler\
    --memory-size 128 \
    --zip-file fileb://function2.zip \
    --role arn:aws:iam::111111111111:role/apigw \
    --endpoint-url http://localhost:4566 >/dev/null

zip function3.zip post_topic_messages.py
aws lambda create-function \
    --function-name apigw-lambda3 \
    --runtime python3.8 \
    --handler post_topic_messages.lambda_handler\
    --memory-size 128 \
    --zip-file fileb://function3.zip \
    --role arn:aws:iam::111111111111:role/apigw \
    --timeout 600 \
    --endpoint-url http://localhost:4566 >/dev/null

zip function4.zip process_data.py
aws lambda create-function \
    --function-name apigw-lambda4 \
    --runtime python3.8 \
    --handler process_data.lambda_handler\
    --memory-size 128 \
    --zip-file fileb://function4.zip \
    --role arn:aws:iam::111111111111:role/apigw \
    --timeout 600 \
    --endpoint-url http://localhost:4566 >/dev/null

zip function5.zip email_sended.py
aws lambda create-function \
    --function-name apigw-lambda5 \
    --runtime python3.8 \
    --handler email_sended.lambda_handler\
    --memory-size 128 \
    --zip-file fileb://function5.zip \
    --role arn:aws:iam::111111111111:role/apigw \
    --timeout 600 \
    --endpoint-url http://localhost:4566 >/dev/null

aws sns subscribe --protocol lambda \
  --topic-arn arn:aws:sns:us-east-1:000000000000:sensor_error \
  --notification-endpoint arn:aws:lambda:us-east-1:000000000000:function:apigw-lambda3 \
  --endpoint-url http://localhost:4566

aws lambda create-event-source-mapping --function-name apigw-lambda4  --batch-size 10 \
  --event-source-arn arn:aws:sqs:us-east-1:000000000000:Bins_Salerno \
  --endpoint-url http://localhost:4566

output=$(aws apigateway create-rest-api --name 'API Gateway Lambda integration' --endpoint-url http://localhost:4566 )

REST_API_ID=$(echo "$output" | jq -r '.id')
echo 'REST_API_ID:'$REST_API_ID

jq -n --arg value "$REST_API_ID" '{"REST_API_ID": $value}' > web_app/config.json

output=$(aws apigateway get-resources --rest-api-id $REST_API_ID --endpoint-url http://localhost:4566)

PARENT_ID=$(echo "$output" | jq -r '.items[0].id')
echo 'PARENT_ID:'$PARENT_ID

output=$(aws apigateway create-resource \
  --rest-api-id $REST_API_ID \
  --parent-id $PARENT_ID \
  --path-part "{somethingId}"\
  --endpoint-url http://localhost:4566 \
  )

RESOURCE_ID=$(echo "$output" | jq -r '.id')
echo 'RESOURCE_ID:'$RESOURCE_ID

aws apigateway put-method \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID \
  --http-method GET \
  --request-parameters "method.request.path.somethingId=true" \
  --authorization-type "NONE" \
  --endpoint-url http://localhost:4566 

aws apigateway put-method \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --request-parameters "method.request.path.somethingId=true" \
  --authorization-type "NONE" \
  --endpoint-url http://localhost:4566 

aws apigateway put-integration \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:apigw-lambda/invocations \
  --passthrough-behavior WHEN_NO_MATCH \
  --endpoint-url http://localhost:4566

aws apigateway put-integration \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:apigw-lambda2/invocations \
  --passthrough-behavior WHEN_NO_MATCH \
  --endpoint-url http://localhost:4566

output=$(aws apigateway create-resource \
  --rest-api-id $REST_API_ID \
  --parent-id $PARENT_ID \
  --path-part error_message\
  --endpoint-url http://localhost:4566 \
  )

RESOURCE_ID2=$(echo "$output" | jq -r '.id')
echo 'RESOURCE_ID:'$RESOURCE_ID2

aws apigateway put-method \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID2 \
  --http-method GET \
  --request-parameters "method.request.path.somethingId=true" \
  --authorization-type "NONE" \
  --endpoint-url http://localhost:4566 

aws apigateway put-integration \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID2 \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:apigw-lambda5/invocations \
  --passthrough-behavior WHEN_NO_MATCH \
  --endpoint-url http://localhost:4566

aws apigateway create-deployment \
  --rest-api-id $REST_API_ID \
  --stage-name test \
  --endpoint-url http://localhost:4566