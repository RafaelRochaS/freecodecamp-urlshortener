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

const cors = corsMiddleware({
  origins: ['*'],
});

const urls = new Map();

let index = 0;

function checkUrlMiddleware(req: Request, res: Response, next: Next): void {
  if (req.method === 'POST') {
    if (req.body['url'] === null || req.body['url'] === undefined) {
      res.status(400);
      return res.json({ error: 'no url informed' });
    }
  }
  return next();
}

function validateUrlMiddleware(req: Request, res: Response, next: Next): void {
  if (req.method === 'POST') {
    let { url } = req.body;
    if (url.startsWith('https')) {
      url = url.substring(8);
    } else if (url.startsWith('http')) {
      url = url.substring(7);
    }
    dns.lookup(url, (err, addresses) => {
      console.log(addresses);
      if (err != null) {
        res.status(400);
        return res.json({ error: 'invalid url' });
      }
      return next();
    });
  }
}

const server = createServer();

server.pre(cors.preflight);
server.use(cors.actual);
server.use(plugins.bodyParser({}));
server.use(checkUrlMiddleware);
server.use(validateUrlMiddleware);

server.get('/', async (req: Request, res: Response) => {
  res.json({ status: 'online' });
});

server.get('/api/shorturl/:url', async (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

server.post('/api/shorturl/', async (req: Request, res: Response) => {
  index += 1;
  urls.set(index, req.body['url']);
  console.log(urls);
  res.status(201);
  res.json({ original_url: req.body['url'], short_url: index });
});

server.listen(PORT, HOST, () => {
  console.log(`${server.name} listening at ${server.url}`);
});
