import nextConnect from "next-connect";
import multer from "multer";
import fetch from "node-fetch";
import UserAgent from "user-agents";

const neatCsv = require("neat-csv");
const ObjectsToCsv = require("objects-to-csv");
const flatten = require("flat");

async function fetchUsers(screen_name) {
  const userAgent = new UserAgent();

  const response = await fetch(`https://instagram.com/${screen_name}/?__a=1`, {
    headers: {
      "User-Agent": userAgent.toString(),
    },
  });

  const json = await response.json();

  return json.graphql?.user;
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
  const numApiCalls = numItems;
  let result = [];

  try {
    for (let i = 0; i < numApiCalls; i++) {
      let screen_name = "";
      if (list[i]) {
        if (list[i]["0"]?.trim?.()) {
          screen_name = list[i]["0"];
        }
      }

      if (screen_name.trim()) {
        const userResult = await fetchUsers(screen_name);
        if (userResult) {
          result.push(flatten(userResult));
        }
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
