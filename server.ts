import { Next, Request, Response, createServer } from 'restify';

const PORT = process.env['PORT'] || 3000;

const respond = (req: Request, res: Response, next: Next) => {
  res.send('hello ' + req.params.name);
  next();
}

let server = createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(PORT, () => {
  console.log('%s listening at %s', server.name, server.url);
});