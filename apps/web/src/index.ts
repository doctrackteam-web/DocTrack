import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { APP_CONFIG } from '@doctrack/config';
import { GET as healthHandler } from './app/health/route.js';
import { GET as readyHandler } from './app/ready/route.js';
import { GET as metricsHandler } from './app/metrics/route.js';

// Import Route Handlers for Standalone Node Server
import { POST as registerHandler } from './app/api/v1/auth/register/route.js';
import { POST as loginHandler } from './app/api/v1/auth/login/route.js';
import { POST as uploadHandler } from './app/api/v1/documents/upload/route.js';
import { POST as completeDocHandler } from './app/api/v1/documents/complete/route.js';
import { POST as createLinkHandler } from './app/api/v1/links/route.js';
import { POST as accessViewerHandler } from './app/api/v1/view/access/route.js';
import { POST as eventAnalyticsHandler } from './app/api/v1/analytics/event/route.js';
import { POST as sigRequestHandler } from './app/api/v1/signatures/request/route.js';
import { POST as signHandler } from './app/api/v1/signatures/sign/route.js';
import { GET as certHandler } from './app/api/v1/signatures/certificate/[id]/route.js';
import { GET as subHandler } from './app/api/v1/billing/subscription/route.js';
import { POST as checkoutHandler } from './app/api/v1/billing/checkout/route.js';
import { POST as webhookHandler } from './app/api/v1/billing/webhook/route.js';

async function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', (err) => reject(err));
  });
}

export const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  try {
    const rawBody = method === 'POST' || method === 'PUT' ? await parseBody(req) : undefined;
    const webReq = new Request(url.toString(), {
      method,
      headers: req.headers as Record<string, string>,
      body: rawBody,
    });

    let webRes: Response;

    if (pathname === '/health' && method === 'GET') {
      webRes = await healthHandler();
    } else if (pathname === '/ready' && method === 'GET') {
      webRes = await readyHandler();
    } else if (pathname === '/metrics' && method === 'GET') {
      webRes = await metricsHandler();
    } else if (pathname === '/api/v1/auth/register' && method === 'POST') {
      webRes = await registerHandler(webReq);
    } else if (pathname === '/api/v1/auth/login' && method === 'POST') {
      webRes = await loginHandler(webReq);
    } else if (pathname === '/api/v1/documents/upload' && method === 'POST') {
      webRes = await uploadHandler(webReq);
    } else if (pathname === '/api/v1/documents/complete' && method === 'POST') {
      webRes = await completeDocHandler(webReq);
    } else if (pathname === '/api/v1/links' && method === 'POST') {
      webRes = await createLinkHandler(webReq);
    } else if (pathname === '/api/v1/view/access' && method === 'POST') {
      webRes = await accessViewerHandler(webReq);
    } else if (pathname === '/api/v1/analytics/event' && method === 'POST') {
      webRes = await eventAnalyticsHandler(webReq);
    } else if (pathname === '/api/v1/signatures/request' && method === 'POST') {
      webRes = await sigRequestHandler(webReq);
    } else if (pathname === '/api/v1/signatures/sign' && method === 'POST') {
      webRes = await signHandler(webReq);
    } else if (pathname.startsWith('/api/v1/signatures/certificate/') && method === 'GET') {
      const certId = pathname.split('/').pop() || '';
      webRes = await certHandler(webReq, { params: { id: certId } });
    } else if (pathname === '/api/v1/billing/subscription' && method === 'GET') {
      webRes = await subHandler(webReq);
    } else if (pathname === '/api/v1/billing/checkout' && method === 'POST') {
      webRes = await checkoutHandler(webReq);
    } else if (pathname === '/api/v1/billing/webhook' && method === 'POST') {
      webRes = await webhookHandler(webReq);
    } else {
      webRes = new Response(JSON.stringify({ status: 404, message: 'Endpoint Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    res.statusCode = webRes.status;
    webRes.headers.forEach((val, key) => res.setHeader(key, val));
    const resText = await webRes.text();
    res.end(resText);
  } catch (err: unknown) {
    const error = err as Error;
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 500, error: error.message || 'Internal Server Error' }));
  }
});

const PORT = process.env.PORT || 3000;

function handleShutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log('HTTP Server closed successfully.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.stack || err.message);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(
      `Initialized ${APP_CONFIG.name} Serverless / Standalone HTTP Server v${APP_CONFIG.version}`,
    );
    console.log(`Listening on http://localhost:${PORT}`);
  });
}
