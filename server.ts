import { Next, Request, Response, createServer } from 'restify';
import corsMiddleware from 'restify-cors-middleware2';

const PORT = process.env['PORT'] || 3000;

const cors = corsMiddleware({
  origins: ["*"],
});


const respond = (req: Request, res: Response, next: Next) => {
  res.send('hello ' + req.params.name);
  next();
}

let server = createServer();

server.pre(cors.preflight);
server.use(cors.actual);

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(PORT, () => {
  console.log('%s listening at %s', server.name, server.url);
});