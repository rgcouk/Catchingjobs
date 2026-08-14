# Use React Router v7 SSR for SEO

We decided to migrate the frontend architecture from a Vite React SPA to React Router v7 with Server-Side Rendering (SSR). 

Our primary growth strategy relies on localized SEO hubs (e.g., `/chickens/boston`) ranking well on Google. A standard client-side rendered SPA presents an empty HTML shell to crawlers, severely hindering local SEO efforts. By adopting React Router v7 SSR, we can query our `Town` and `Region` database models on the server and return fully populated HTML for these location hubs, ensuring optimal search engine indexability while maintaining our existing React component architecture.
