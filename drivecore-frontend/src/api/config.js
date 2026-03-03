/**
 * src/api/config.js
 *
 * Central registry for all DriveCore microservice base URLs.
 * All values are driven by Vite environment variables (VITE_ prefix)
 * so they can be swapped per environment (local, staging, AWS ECS)
 * without touching source code — just update .env or your CI secrets.
 *
 * AWS ECS example:
 *   VITE_AUTH_SERVICE_URL=http://34.201.11.xx:3001
 *   VITE_BOOKING_SERVICE_URL=http://3.92.44.xx:3002
 *   VITE_INVENTORY_SERVICE_URL=http://54.163.xx.xx:3003
 *   VITE_BILLING_SERVICE_URL=http://18.215.xx.xx:3004
 */
const services = {
  AUTH:      import.meta.env.VITE_AUTH_SERVICE_URL      || 'http://16.16.104.164:3001',
  BOOKING:   import.meta.env.VITE_BOOKING_SERVICE_URL   || 'http://13.60.249.34:3002',
  INVENTORY: import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://13.49.23.2:3003',
  BILLING:   import.meta.env.VITE_BILLING_SERVICE_URL   || 'http://16.170.253.87:3004',
}

export default services
