/* eslint-disable no-prototype-builtins */
import {
  Next,
  Request,
  Response,
  createServer,
  plugins,
} from 'restify';
import corsMiddleware from 'restify-cors-middleware2';
import dns from 'dns';

const PORT = process.env['PORT'] || 3000;
const HOST = process.env['HOST'] || '0.0.0.0';

// const cors = corsMiddleware({
//   origins: ['https://freecodecamp.org'],
// });

const urls = new Map<number, string>();

let index = 0;

function checkUrlMiddleware(req: Request, res: Response, next: Next): void {
  if (req.method === 'POST') {
    if (req.body['url'] === null || req.body['url'] === undefined) {
      res.status(400);
      res.json({ error: 'no url informed' });
    }
  }
  next();
}

const server = createServer();

// server.pre(cors.preflight);
// server.use(cors.actual);
server.use(
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    return next();
  },
);
server.use(plugins.bodyParser({}));

server.get('/', async (req: Request, res: Response) => {
  res.json({ status: 'online' });
});

server.get('/api/shorturl/:url', async (req: Request, res: Response, next: Next) => {
  const url = urls.get(parseInt(req.params.url, 10));
  if (url != null) {
    res.redirect(301, url, next);
  } else {
    res.json({ error: 'url not found' });
  }
});

server.use(checkUrlMiddleware);

server.post('/api/shorturl/', async (req: Request, res: Response) => {
  let { url } = req.body;
  let valid = true;
  if (url.startsWith('https')) {
    url = url.substring(8);
  } else if (url.startsWith('http')) {
    url = url.substring(7);
  }
  dns.lookup(url, (err, addresses) => {
    console.log(addresses);
    if (addresses === null || addresses === undefined) {
      valid = false;
    }
    if (!valid) {
      res.status(400);
      return res.json({ error: 'invalid url' });
    }
    index += 1;
    urls.set(index, req.body['url']);
    console.log(urls);
    res.status(201);
    return res.json({ original_url: req.body['url'], short_url: index });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`${server.name} listening at ${server.url}`);
});
