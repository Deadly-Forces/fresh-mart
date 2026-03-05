import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*");

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
    } else {
        console.log("--- PROFILES ---");
        console.log(JSON.stringify(profiles, null, 2));
    }

    const { data: addresses, error: addressError } = await supabase
        .from("addresses")
        .select("*");

    if (addressError) {
        console.error("Error fetching addresses:", addressError);
    } else {
        console.log("--- ADDRESSES ---");
        console.log(JSON.stringify(addresses, null, 2));
    }
}

main();
