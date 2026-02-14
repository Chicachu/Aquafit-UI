/**
 * Local dev pointing at the Koyeb API. Use: ng serve --configuration=koyeb
 * Requests to /api are proxied to Koyeb via proxy.conf.koyeb.json (no CORS).
 */
export const environment = {
  production: false,
  apiUrl: '/api',
};
