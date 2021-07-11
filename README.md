# Covalent AWS Serverless
This repository is a Covalent Serverless Application deployed on Amazon Web Services. This wrapper will assist developers who want to utilize Covalent data without any server setup needed (serverless).

There consist of 2 modules:
-	[aws-lambda](#aws-lambda)
-	[react-app](#react-app)

# aws-lambda
A Lambda function for requesting [Covalent API](https://www.covalenthq.com/docs/api).

### How to setup
- Go to [AWS Lambda Functions page](https://console.aws.amazon.com/lambda)

- Click [Create function](https://console.aws.amazon.com/lambda/#/create/function) Button to start creating function

- Enter your Lambda function information

	<img width="1328" alt="lambda-function-information" src="https://user-images.githubusercontent.com/13881651/124514516-6ecd0780-de07-11eb-81b3-babd9474141c.png">

- Click `Create function` Button

- Now go back to `aws-lambda` directory

- Install dependencies
	```
	npm install
	```

- Zip all files and folders inside `aws-lambda` directory

- Upload `.zip` file on Code section

	<img width="1308" alt="upload-zip-file" src="https://user-images.githubusercontent.com/13881651/124515395-90c78980-de09-11eb-8c37-f74a2f1caf84.png">

- Go to Configuration section
	- General configuration
		- set Timeout to 30 seconds
	- Environment variables

		```
		API_HOST = https://api.covalenthq.com/v1/
		API_KEY = {YOUR_COVALENT_API_KEY}
		```
- Click `+ Add trigger` Button

	<img width="848" alt="add-trigger" src="https://user-images.githubusercontent.com/13881651/124516020-008a4400-de0b-11eb-8b58-16c54dc65116.png">

- Set Trigger configuration

	<img width="719" alt="trigger-configuration" src="https://user-images.githubusercontent.com/13881651/124516349-a047d200-de0b-11eb-9115-a94b4ccbc466.png">

- Click `Add` Button

- After add trigger successfully, you will find the `API Gateway: covalent` trigger

- You can get your `API endpoint` in Details

- How to use your API on AWS
	```
	GET {API endpoint}?path={COVALENT_API_PATH}&param1=value1&param2=value2&...
	```
<br><br>
# react-app
An example of React app using [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html).

[DEMO](http://covalent.serverless.s3-website-us-west-1.amazonaws.com/)

### How to setup
- Go to `react-app` directory

- Set environment variable in [.env](/react-app/.env) file
	```
	REACT_APP_COVALENT_API_AWS_URL={AWS_API_GATEWAY_ENDPOINT}
	```

- Install dependencies
	```
	npm install --force
	```

- Run on localhost
	```
	npm start
	```

- Build app
	```
	npm run build
	```

- Deploy app on AWS S3 (Optional)
	-	Create AWS S3 Bucket for [Hosting a static website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)
	-	Install [AWS CLI](https://github.com/aws/aws-cli#aws-cli)
	-	Edit deploy script in [package.json](/react-app/package.json) file

		Replace `{YOUR_S3_BUCKET_NAME}` with your AWS S3 Bucket name

		```
		"deploy": "aws s3 sync build/ s3://{YOUR_S3_BUCKET_NAME} --acl public-read"
		```
	- Deploy app

		```
		npm run deploy
		```
	- Now you can [visit yout website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)
