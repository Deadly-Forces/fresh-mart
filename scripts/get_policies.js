const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function run() {
  const { data, error } = await s.rpc("exec_sql", {
    query: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`,
  });
  if (error) {
    // try direct query if rpc exec_sql doesn't exist
    console.error("RPC exec_sql failed, it might not exist.", error);
  } else {
    console.log(data);
  }
}

run();
