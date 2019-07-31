const {
  LOG_LEVEL = "info",
  CLIENT_ID,
  CLIENT_SECRET,
  PASSWORD,
  SUBREDDIT,
  USERNAME,
} = process.env;

const { version } = require("./package");
const pino = require("pino");
const Snoowrap = require("snoowrap");

// globals
const logger = pino({ level: LOG_LEVEL });
const reddit = new Snoowrap({
  userAgent: `nodejs:com.allhailbot.cfb-trivia:v${version} (by /u/pushECX)`,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  password: PASSWORD,
  username: USERNAME,
});

async function main() {
  logger.info("start");

  try {
    const [result] = await reddit.search({
      query: ["subreddit:CFB", "self:yes", 'title:"Trivia Tuesday"'].join(" "),
      time: "week",
      sort: "new",
      syntax: "lucene",
      limit: 1,
    });

    // return early if no post was found
    if (!result) {
      logger.error("no /r/CFB Trivia Tuesday submission found");
      logger.info("complete");
      return;
    }

    logger.info(`found /r/CFB Trivia Tuesday submission: ${result.url}`);
    const submission = await reddit
      .getSubreddit(SUBREDDIT)
      .submitLink({
        title: "Join us in playing Trivia Tuesday over on /r/CFB!",
        url: result.url,
        sendReplies: false,
        resubmit: false,
      })
      .fetch();
    logger.info(`new submission: ${submission.permalink}`);
    await submission.distinguish();
    const comment = await submission
      .reply(
        `
As occurs every Tuesday, we're playing Trivia Tuesday over on /r/CFB and we'd
like you to join!

Instructions, standings, etc. can be found in [this week's Trivia Tuesday
thread](${result.url}), so head on over there!

---

*I am a bot. If you notice anything off with this post or with my behavior,
please message the moderators.*`
      )
      .fetch();
    await comment.distinguish({ sticky: true });
    logger.info(`new comment: ${comment.permalink}`);
  } catch (error) {
    logger.error(error);
  }

  logger.info("complete");
}

// call main() if this file is the entry script
if (require.main === module) {
  main();
}
