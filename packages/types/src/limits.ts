/** Shared abuse / cost caps — keep free-tier spend under control. */

/** Max INR credited in a single on-ramp request. */
export const ONRAMP_MAX_AMOUNT_INR = 500

/** Max INR a user can on-ramp per UTC day. */
export const ONRAMP_DAILY_MAX_INR = 2_000

/** Max order quantity per place-order. */
export const ORDER_MAX_QUANTITY = 100

/** Max mint pairs in one request. */
export const MINT_MAX_AMOUNT = 500

/** Max avatar upload size (bytes) — enforced on S3 Content-Length. */
export const PFP_MAX_BYTES = 512 * 1024

/** Max market title / description lengths. */
export const MARKET_TITLE_MAX = 120
export const MARKET_DESCRIPTION_MAX = 2_000

/** How many user orders to return per request. */
export const USER_ORDERS_TAKE = 100

/** Cap trades returned from engine get_trades. */
export const TRADES_TAKE = 100
