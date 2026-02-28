export const TRANSACTION_TYPES = [
	"deposit",
	"withdraw",
	"payment",
	"earning",
	"refund",
	"platform_fee",
	"release",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
