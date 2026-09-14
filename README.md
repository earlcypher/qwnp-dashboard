# Qwen Proxy Dashboard

A modern web dashboard for managing API keys for the Qwen Proxy server.

## Features

- 🔐 Secure admin authentication with enterprise-tier API keys
- 📊 Real-time statistics dashboard (total keys, active keys, requests, tier breakdown)
- 🔑 Complete API key management (create, view, update, delete)
- 🎨 Modern dark theme with responsive design
- 🔍 Search and filter functionality
- 📱 Mobile-friendly interface
- ⚡ Built with Next.js 16 and TypeScript

## Prerequisites

- Node.js 18+ (for running the dashboard)
- Running Qwen Proxy server (either v1 or v2)
- Enterprise-tier API key for admin access

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, set it to your deployed Qwen Proxy URL:

```env
NEXT_PUBLIC_API_URL=https://your-proxy-domain.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Usage

### Login

1. Navigate to the dashboard URL
2. Enter your **enterprise-tier API key** (only enterprise keys have admin access)
3. The key is validated against the Qwen Proxy server
4. Upon successful login, you're redirected to the dashboard

### Dashboard Features

#### Statistics Cards
- **Total Keys**: All API keys in the system
- **Active Keys**: Currently active API keys
- **Total Requests**: Cumulative API usage across all keys
- **By Tier**: Breakdown of keys by tier (free, premium, enterprise)

#### API Key Management

**Create New Key:**
1. Click "Create Key" button
2. Enter a name for the key
3. Select tier (free, premium, or enterprise)
4. Copy the generated key (shown only once!)

**View Keys:**
- See all keys in a sortable table
- Search by name or tier
- View usage statistics per key

**Toggle Active Status:**
- Click "Activate" or "Deactivate" to enable/disable a key
- Inactive keys cannot be used for API requests

**Delete Key:**
- Click "Delete" to remove a key permanently
- Confirmation dialog prevents accidental deletion

### Mobile Support

The dashboard is fully responsive:
- Statistics cards stack on small screens
- Table adapts with hidden columns on mobile
- Touch-friendly action buttons

## API Integration

The dashboard connects to the Qwen Proxy admin API:

- `GET /admin/stats` - Get usage statistics
- `GET /admin/api-keys` - List all API keys
- `POST /admin/api-keys` - Create new API key
- `PUT /admin/api-keys/:id` - Update API key
- `DELETE /admin/api-keys/:id` - Delete API key

All requests require an `Authorization: Bearer <enterprise-key>` header.

## Project Structure

```
qwen-dashboard/
├── app/
│   ├── page.tsx              # Login page
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   └── api.ts                # API client functions
├── .env.example              # Environment template
└── README.md                 # This file
```

## Security Notes

- Admin keys are stored in browser localStorage (client-side only)
- Keys are transmitted over HTTPS in production
- API keys are never logged or exposed in the UI after creation
- Use enterprise-tier keys for admin access only
- Regular API keys cannot access admin endpoints

## Development

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Custom dark theme components

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Qwen Proxy server URL | `http://localhost:3000` |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Docker

```bash
# Build
docker build -t qwen-dashboard .

# Run
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.example.com qwen-dashboard
```

### Static Export

```bash
npm run build
# Deploy the ./out directory to any static host
```

## Troubleshooting

### "Invalid API key" on login
- Ensure you're using an **enterprise-tier** API key
- Verify the API URL is correct in `.env.local`
- Check that the Qwen Proxy server is running

### "Failed to load data"
- Verify network connectivity to the proxy server
- Check browser console for CORS errors
- Ensure the proxy server has CORS headers enabled

### Build errors
- Run `npm install` to ensure dependencies are up to date
- Check Node.js version (requires 18+)
- Clear `.next` directory and rebuild

## License

MIT

## Related Projects

- [qwen-proxy](../qwen-proxy) - Qwen Proxy server with API key management
- [qwen-proxy-v2](../qwen-proxy-v2) - Simplified proxy with Supabase backend
