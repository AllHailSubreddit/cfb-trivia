# cfb-trivia-tuesday

A containerized cron job that checks the /r/CFB subreddit for the latest Trivia
Tuesday submission and creates a new submission in the target subreddit inviting
users to play for our team.

## Usage

Build the image.
  
```shell script
docker build -t allhail/cfb-trivia:local .
```

Run the image.
  
```shell script
docker run --name allhail_cfb-trivia \
           --env-file .env \
           --rm \
           allhail/cfb-trivia:local
```

For more readable output, filter the output through the `pino-pretty` package.

```shell script
docker run ... | npx pino-pretty
```

## Environment variables

- **LOG_LEVEL**  
Determines the severity of data logged. Possible values are "error", "warn",
"info", "debug", and "trace".
- **REDDIT_CLIENT_ID**  
The client ID provided by Reddit for your application.
- **REDDIT_CLIENT_SECRET**  
The client secret provided by Reddit for your application.
- **REDDIT_PASSWORD**  
The password of the Reddit account that will create the new submission.
- **REDDIT_SUBREDDIT**  
The name of the subreddit where the new submission will be made. Should not
include any prefix. E.g. "AllHail".
- **REDDIT_USERNAME**  
The username of the Reddit account that will create the new submission.
