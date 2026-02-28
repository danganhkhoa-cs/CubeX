import { supabase } from "../config/supabase";
import type { TransactionType } from "../types/transaction";

export async function createTransaction(
	wallet_id: string,
	amount: number,
	type: TransactionType,
	order_id?: string,
): Promise<any> {
	return await supabase.rpc("create_transaction", {
		p_wallet_id: wallet_id,
		p_order_id: order_id || null,
		p_amount: amount,
		p_type: type,
	});
}
