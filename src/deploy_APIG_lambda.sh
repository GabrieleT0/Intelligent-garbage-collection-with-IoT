zip function.zip last_measurements.py
aws lambda create-function \
    --function-name apigw-lambda \
    --runtime python3.8 \
    --handler last_measurements.lambda_handler\
    --memory-size 128 \
    --zip-file fileb://function.zip \
    --role arn:aws:iam::111111111111:role/apigw \
    --endpoint-url http://localhost:4566 >/dev/null


output=$(aws apigateway create-rest-api --name 'API Gateway Lambda integration' --endpoint-url http://localhost:4566)

REST_API_ID=$(echo "$output" | jq -r '.id')
echo 'REST_API_ID:'$REST_API_ID

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

aws apigateway put-integration \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:apigw-lambda/invocations \
  --passthrough-behavior WHEN_NO_MATCH \
  --endpoint-url http://localhost:4566

aws apigateway create-deployment \
  --rest-api-id $REST_API_ID \
  --stage-name test \
  --endpoint-url http://localhost:4566