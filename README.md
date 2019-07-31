# cfb-trivia-tuesday

A containerized cron job that checks the /r/CFB subreddit for the latest Trivia
Tuesday submission and creates a new submission in the target subreddit inviting
users to play for our team.

## Usage

Build the image.
  
```shell script
docker build -t cfb-trivia-tuesday .
```

Run the image.
  
```shell script
docker run --env-file .env cfb-trivia-tuesday
```

For more readable output, filter the output through the `pino-pretty` package.

```shell script
docker run --env-file .env cfb-trivia-tuesday | npx pino-pretty
```

## Environment variables

- **CLIENT_ID**  
The client ID provided by Reddit for your application.
- **CLIENT_SECRET**  
The client secret provided by Reddit for your application.
- **LOG_LEVEL**  
Determines the severity of data logged. Possible values are "error", "warn",
"info", "debug", and "trace".
- **PASSWORD**  
The password of the Reddit account that will create the new submission.
- **SUBREDDIT**  
The name of the subreddit where the new submission will be made. Should not
include any prefix. E.g. "AllHail".
- **USERNAME**  
The username of the Reddit account that will create the new submission.
