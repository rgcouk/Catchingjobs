# Split Monolithic Express API into Hono Serverless Functions

To avoid the monolithic cold-start penalty and scale endpoints independently on Vercel, we are migrating the single Express backend (`/api/index.ts`) to individual serverless functions organized under the `/api/` directory. 

We are adopting the **Hono** framework for these new serverless handlers instead of Express. Hono provides an Express-like routing experience but is significantly lighter and purpose-built for serverless/edge environments. To support this scale-out architecture, we will configure the Prisma connection string to use the database provider's built-in connection pooler (Neon/Supabase), ensuring the Postgres max-connection limit is not exhausted by concurrent serverless invocations.
