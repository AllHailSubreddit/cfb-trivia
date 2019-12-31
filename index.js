if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const {
  LOG_LEVEL,
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_PASSWORD,
  REDDIT_SUBREDDIT,
  REDDIT_USERNAME,
} = process.env;
const {
  name: TASK_NAME,
  version: TASK_VERSION,
  author: AUTHOR,
} = require("./package");

const pino = require("pino");
const Snoowrap = require("snoowrap");

const logger = pino({
  level: LOG_LEVEL,
  messageKey: "message",
  base: {
    name: "allhailbot",
    taskName: TASK_NAME,
    taskVersion: TASK_VERSION,
  },
});
const reddit = new Snoowrap({
  userAgent: `nodejs:org.allhail.bot.${TASK_NAME}:v${TASK_VERSION} (by ${AUTHOR})`,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  username: REDDIT_USERNAME,
  password: REDDIT_PASSWORD,
});

async function main() {
  logger.info("start");

  // search for the latest trivia submission
  logger.debug("searching for new trivia submission");
  let result;
  try {
    [result] = await reddit.search({
      query: ["subreddit:CFB", "self:yes", 'title:"Trivia Tuesday"'].join(" "),
      time: "week",
      sort: "new",
      syntax: "lucene",
      limit: 1,
    });
    logger.info("search for new trivia submission complete");
  } catch (error) {
    logger.error(error, "failed to search for latest trivia submissions");
    return;
  }

  // ensure a trivia submission was found
  if (!result) {
    logger.error("failed to find new trivia submission");
    return;
  }

  logger.info(`new trivia submission found: ${result.url}`);

  // create a new link submission pointing to the trivia tuesday submission
  logger.debug("creating new link submission");
  let submission;
  try {
    submission = await reddit
      .getSubreddit(REDDIT_SUBREDDIT)
      .submitLink({
        title: "Play Trivia Tuesday with us over on /r/CFB!",
        url: result.url,
        sendReplies: false,
        resubmit: false,
      })
      .fetch();
    logger.info(
      `new link submission created: https://www.reddit.com${submission.permalink}`
    );
  } catch (error) {
    logger.error(error, "failed to create new link submission");
    return;
  }

  logger.debug("distinguishing new link submission");
  try {
    await submission.distinguish();
    logger.info("new link submission distinguished");
  } catch (error) {
    logger.error(error, "failed to distinguish new link submission");
  }

  logger.debug("flairing new link submission");
  try {
    const flairTemplates = await submission.getLinkFlairTemplates();
    const relevantFlair = flairTemplates.find(
      ({ flair_text }) => flair_text === "Meta"
    );

    if (!relevantFlair) {
      throw new Error("no relevant flair found");
    }

    await submission.selectFlair({
      flair_template_id: relevantFlair.flair_template_id,
    });
    logger.info("new link submission flaired");
  } catch (error) {
    logger.error(error, "failed to flair new link submission");
  }

  // add a comment to the new link submission informing users how to play
  logger.debug("creating new comment");
  let comment;
  try {
    comment = await submission
      .reply(
        `
It's Tuesday again, which means we're playing Trivia Tuesday over on /r/CFB and
we'd like you to join us!

Instructions, standings, etc. can be found in [today's Trivia Tuesday
thread](${result.url}), so head on over there!

---

_I am a bot. If you notice a problem or have a suggestion regarding me, please message the moderators._`
      )
      .fetch();
    logger.info(
      `new comment created: https://www.reddit.com${comment.permalink}`
    );
  } catch (error) {
    logger.error(error, "failed to create new comment on new link submission");
    return;
  }

  logger.debug("distinguishing new comment");
  try {
    await comment.distinguish({ sticky: true });
    logger.info("new comment distinguished");
  } catch (error) {
    logger.error(error, "failed to distinguish new comment");
  }

  logger.info(
    {
      triviaSubmissionUrl: result.url,
      newLinkSubmissionUrl: `https://www.reddit.com${submission.permalink}`,
      newCommentUrl: `https://www.reddit.com${comment.permalink}`,
    },
    "complete"
  );
}

// check if this is the entry script
if (require.main === module) {
  main();
}
