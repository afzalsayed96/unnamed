import nextConnect from "next-connect";
import multer from "multer";
import { TwitterClient } from "twitter-api-client";

const neatCsv = require("neat-csv");
const ObjectsToCsv = require("objects-to-csv");

const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

const twitterClient = new TwitterClient({
  apiKey,
  apiSecret,
  accessToken,
  accessTokenSecret,
});

async function fetchUsers(screen_name) {
  return await twitterClient.accountsAndUsers.usersLookup({ screen_name });
}

const upload = multer({
  storage: multer.memoryStorage(),
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("list"));

apiRoute.post(async (req, res) => {
  const list = await neatCsv(req.file.buffer, { headers: false });
  const numItems = list.length;
  const numApiCalls = Math.ceil(numItems / 100);
  let result = [];

  try {
    for (let i = 0; i < numApiCalls; i++) {
      let screen_name = "";
      for (let j = 0; j < 100; j++) {
        if (list[i * 100 + j]) {
          if (list[i * 100 + j]["0"]?.trim?.()) {
            screen_name += `${list[i * 100 + j]["0"].trim()},`;
          }
        } else break;
      }

      if (screen_name.trim()) {
        const userResults = await fetchUsers(screen_name);
        result = result.concat(userResults);
      }
    }
  } catch (e) {
    console.log(e);
  }
  const data = await new ObjectsToCsv(result).toString();

  res.status(200).json({ data });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
