const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function analyze() {
    const { data: categories, error: catError } = await s.from('categories').select('id, name');
    if (catError) { console.error("Categories error:", catError); return; }

    const { data: products, error: prodError } = await s.from('products').select('category_id');
    if (prodError) { console.error("Products error:", prodError); return; }

    const counts = {};
    products.forEach(p => {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });

    console.log('Category Product Counts:');
    categories.forEach(c => {
        console.log(`- ${c.name}: ${counts[c.id] || 0} products`);
    });
}

analyze().catch(console.error);
