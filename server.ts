import { Next, Request, Response, createServer, plugins } from 'restify';
import corsMiddleware from 'restify-cors-middleware2';
import dns from 'dns';

const PORT = process.env['PORT'] || 3000;
const HOST = process.env['HOST'] || '0.0.0.0';

const cors = corsMiddleware({
  origins: ["*"],
});

let server = createServer();

server.pre(cors.preflight);
server.use(cors.actual);
server.use(plugins.bodyParser({}));

server.get('/', async (req: Request, res: Response) => {
  res.json({ status: 'online' });
});

server.get('/api/shorturl/:url', async (req: Request, res: Response) => {
  res.json({ param: req.params.url });
});

server.post('/api/shorturl/', async (req: Request, res: Response) => {
  if (req.body['url'] == null) {
    return res.json({ error: 'no url informed' });
  }
  dns.lookup(req.body['url'], (err, addresses) => {
    if (err != null) {
      return res.json({ error: 'invalid url' })
    }
  });
  return res.json({ param: req.body });
});

server.listen(PORT, HOST, () => {
  console.log(`${server.name} listening at ${server.url}`);
});
