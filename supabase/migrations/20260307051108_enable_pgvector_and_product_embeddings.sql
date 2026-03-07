-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector
with
  schema extensions;

-- Add embedding column to products table
-- We'll use 1536 dimensions, which is standard for embeddings like OpenAI's text-embedding-3-small
alter table public.products 
add column if not exists embedding vector(1536);

-- Set up an HNSW index for fast nearest-neighbor searches
-- We use inner product (vector_ip_ops) because embeddings are usually normalized.
create index if not exists products_embedding_idx 
on public.products 
using hnsw (embedding vector_ip_ops);

-- Create a database function for similarity search
create or replace function public.match_products (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  description text,
  price numeric,
  images text[],
  similarity float
)
language sql stable
as $$
  select
    products.id,
    products.name,
    products.description,
    products.price,
    products.images,
    1 - (products.embedding <=> query_embedding) as similarity
  from public.products
  where products.is_active = true
    and 1 - (products.embedding <=> query_embedding) > match_threshold
  order by products.embedding <=> query_embedding
  limit match_count;
$$;
