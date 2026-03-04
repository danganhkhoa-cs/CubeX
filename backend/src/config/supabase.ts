import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabasePrivateKey = process.env.SUPABASE_PRIVATE_KEY;

if (!supabaseUrl || !supabaseKey || !supabasePrivateKey) {
	throw new Error("Missing Supabase environment variables");
}

export const supabaseAnon = createClient(supabaseUrl, supabaseKey);
export const supabaseService = createClient(supabaseUrl, supabasePrivateKey);

export const createUserClient = (accessToken: any) => {
	return createClient(supabaseUrl, supabaseKey, {
		global: {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	});
};
