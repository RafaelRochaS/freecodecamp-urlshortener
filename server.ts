import { Next, Request, Response, createServer, plugins } from 'restify';
import corsMiddleware from 'restify-cors-middleware2';
import dns from 'dns';

const PORT = process.env['PORT'] || 3000;
const HOST = process.env['HOST'] || '0.0.0.0';

const cors = corsMiddleware({
  origins: ['*'],
});

function checkUrlMiddleware(req: Request, res: Response, next: Next): void {
  if (req.body['url'] === null || req.body['url'] === undefined) {
    res.status(400);
    return res.json({ error: 'no url informed' });
  }
  return next();
}

function validateUrlMiddleware(req: Request, res: Response, next: Next): void {
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
  res.json({ param: req.params.url });
});

server.post('/api/shorturl/', async (req: Request, res: Response) => {
  res.json({ param: req.body });
});

server.listen(PORT, HOST, () => {
  console.log(`${server.name} listening at ${server.url}`);
});
