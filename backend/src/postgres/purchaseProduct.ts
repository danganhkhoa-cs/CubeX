import { supabase } from "../config/supabase";
import { ShippingInfo } from "../types/shippingInfo";

export async function purchaseProduct(
	product_id: string,
	buyer_id: string,
	shipping_info: ShippingInfo,
): Promise<any> {
	return await supabase.rpc("purchase_product", {
		p_product_id: product_id,
		p_buyer_id: buyer_id,
		p_shipping_info: shipping_info,
	});
}
