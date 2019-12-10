<?php

namespace ccxt;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import

class max extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'max',
            'name' => 'Max',
            'countries' => array ( 'TW' ),
            'version' => 'v2',
            'rateLimit' => 1200,
            'certified' => false,
            'has' => array (
                'CORS' => true,
                'publicAPI' => true,
                'privateAPI' => true,
                'cancelAllOrders' => true,
                'cancelOrder' => true,
                'createDepositAddress' => true,
                'createLimitOrder' => true,
                'createMarketOrder' => true,
                'createOrder' => true,
                'deposit' => false,
                'fetchBalance' => true,
                'fetchBidsAsks' => false,
                'fetchClosedOrders' => true,
                'fetchCurrencies' => true,
                'fetchDepositAddress' => true,
                'fetchDeposits' => false,
                'fetchFundingFees' => false,
                'fetchL2OrderBook' => false,
                'fetchLedger' => false,
                'fetchMarkets' => true,
                'fetchMyTrades' => true,
                'fetchOHLCV' => true,
                'fetchOpenOrders' => true,
                'fetchOrder' => true,
                'fetchOrderBook' => true,
                'fetchOrderBooks' => false,
                'fetchOrders' => true,
                'fetchTicker' => true,
                'fetchTickers' => true,
                'fetchTrades' => true,
                'fetchTradingFee' => false,
                'fetchTradingFees' => false,
                'fetchTradingLimits' => false,
                'fetchTransactions' => false,
                'fetchWithdrawals' => true,
                'withdraw' => false,
            ),
            'timeframes' => array (
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '2h' => '120',
                '6h' => '360',
                '12h' => '720',
                '1d' => '1440',
                '3d' => '4320',
                '1w' => '10080',
            ),
            'urls' => array (
                'logo' => '',
                'api' => array (
                    'web' => 'https://max.maicoin.com',
                    'wapi' => '',
                    'public' => 'https://max-api.maicoin.com',
                    'private' => 'https://max-api.maicoin.com',
                ),
                'www' => 'https://max.maicoin.com',
                'doc' => 'https://max.maicoin.com/documents/api',
                'fees' => 'https://max.maicoin.com/docs/fees',
            ),
            'api' => array (
                'web' => array (
                ),
                'wapi' => array (
                ),
                'public' => array (
                    'get' => array (
                        'markets',
                        'currencies',
                        'tickers/{market_id}',
                        'tickers',
                        'withdrawal/constraint',
                        'depth',
                        'trades',
                        'k',
                        'timestamp',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'members/profile',
                        'members/accounts/{currency_id}',
                        'members/accounts',
                        'members/me',
                        'deposits',
                        'deposit',
                        'deposit_addresses',
                        'withdrawals',
                        'withdrawal',
                        'withdrawal_addresses',
                        'orders',
                        'order',
                        'trades/my/of_order',
                        'trades/my',
                        'internal_transfers',
                        'internal_transfer',
                        'rewards/{reward_type}',
                        'rewards',
                        'max_rewards/yesterday',
                    ),
                    'post' => array (
                        'deposit_addresses',
                        'orders/clear',
                        'orders',
                        'orders/multi',
                        'order/delete',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.05 / 100,
                    'taker' => 0.15 / 100,
                ),
                'funding' => array (
                    'withdraw' => array(),
                    'deposit' => array(),
                ),
            ),
            'commonCurrencies' => array (
            ),
            'options' => array (
                'timeDifference' => 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference' => false, // controls the adjustment logic upon instantiation
            ),
            'exceptions' => array (
                '2004' => '\\ccxt\\OrderNotFound',
                '2005' => '\\ccxt\\AuthenticationError', // Signature is incorrect.
                '2006' => '\\ccxt\\AuthenticationError', // The nonce has already been used by access key.
                '2007' => '\\ccxt\\AuthenticationError', // The nonce is invalid. (30 secconds difference from server time)
                '2008' => '\\ccxt\\AuthenticationError', // The access key does not exist.
                '2009' => '\\ccxt\\AuthenticationError', // The access key is disabled.
                '2011' => '\\ccxt\\AuthenticationError', // Requested API is out of access key scopes.
                '2014' => '\\ccxt\\AuthenticationError', // Payload is not consistent with body or wrong path in payload.
                '2015' => '\\ccxt\\AuthenticationError', // Payload is invalid
                '2016' => '\\ccxt\\InvalidOrder', // amount_too_small
                '2018' => '\\ccxt\\InsufficientFunds', // cannot lock funds
            ),
        ));
    }

    public function nonce () {
        return $this->milliseconds () - $this->options['timeDifference'];
    }

    public function load_time_difference () {
        $serverTimestamp = $this->publicGetTimestamp ();
        $after = $this->milliseconds ();
        $this->options['timeDifference'] = $after - intval ($serverTimestamp, 10) * 1000;
        return $this->options['timeDifference'];
    }

    public function insert_objects_property_by ($a, $keyA, $b, $keyB, $insertKey) {
        $result = array();
        for ($i = 0; $i < count ($a); $i++) {
            $entry = $a[$i];
            $index = $entry[$keyA];
            $result[$index] = $entry;
        }
        for ($i = 0; $i < count ($b); $i++) {
            $entry = $b[$i];
            $index = $entry[$keyB];
            if ($result[$index]) {
                $result[$index][$insertKey] = $entry;
            }
        }
        $values = array();
        $resultKeys = is_array($result) ? array_keys($result) : array();
        for ($i = 0; $i < count ($resultKeys); $i++) {
            $values[] = $result[$resultKeys[$i]];
        }
        return $values;
    }

    public function fetch_currencies ($params = array ()) {
        $currenciesResponse = $this->publicGetCurrencies ($params);
        $withdrawalResponse = $this->publicGetWithdrawalConstraint ();
        $response = $this->insert_objects_property_by (
            $currenciesResponse,
            'id',
            $withdrawalResponse,
            'currency',
            'withdrawal'
        );
        $result = array();
        for ($i = 0; $i < count ($response); $i++) {
            $currency = $response[$i];
            $id = $currency['id'];
            $code = $this->safe_currency_code($id);
            $fiat = $id === 'twd' ? true : false;
            $withdrawal = $this->safe_value($currency, 'withdrawal');
            $withdrawalFee = $this->safe_value($withdrawal, 'fee');
            $withdrawalLimit = $this->safe_value($withdrawal, 'min_amount');
            $result[$code] = array (
                'id' => $id,
                'code' => $code,
                'name' => $code,
                'active' => true,
                'fiat' => $fiat,
                'precision' => $this->safe_integer($currency, 'precision'),
                'limits' => array (
                    'amount' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'price' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'deposit' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'withdraw' => array (
                        'min' => $withdrawalLimit,
                        'max' => null,
                    ),
                ),
                'funding' => array (
                    'withdraw' => array (
                        'fee' => $withdrawalFee,
                    ),
                    'deposit' => array (
                        'fee' => null,
                    ),
                ),
                'info' => $currency,
            );
        }
        return $result;
    }

    public function fetch_markets ($params = array ()) {
        $markets = $this->publicGetMarkets ();
        if ($this->options['adjustForTimeDifference']) {
            $this->load_time_difference ();
        }
        $result = array();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['id'];
            $baseId = $market['base_unit'];
            $quoteId = $market['quote_unit'];
            $base = $this->safe_currency_code($baseId);
            $quote = $this->safe_currency_code($quoteId);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => $market['base_unit_precision'],
                'price' => $market['quote_unit_precision'],
            );
            $active = true;
            $entry = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'baseId' => $baseId,
                'quoteId' => $quoteId,
                'info' => $market,
                'active' => $active,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'price' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'cost' => array (
                        'min' => null,
                        'max' => null,
                    ),
                ),
            );
            $result[] = $entry;
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privateGetMembersAccounts ($params);
        $result = array( 'info' => $response );
        for ($i = 0; $i < count ($response); $i++) {
            $balance = $response[$i];
            $currency = $balance['currency'];
            if (is_array($this->currencies_by_id) && array_key_exists($currency, $this->currencies_by_id)) {
                $currency = $this->currencies_by_id[$currency]['code'];
            }
            $account = $this->account ();
            $account['free'] = $this->safe_float($balance, 'balance');
            $account['used'] = $this->safe_float($balance, 'locked');
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'market' => $market['id'],
        );
        if ($limit !== null) {
            $request['limit'] = $limit; // default = 300
        }
        $response = $this->publicGetDepth (array_merge ($request, $params));
        $timestamp = $this->safe_timestamp($response, 'timestamp');
        $orderbook = $this->parse_order_book($response, $timestamp);
        return $orderbook;
    }

    public function parse_ticker ($ticker, $tickerSymbol, $market = null) {
        $timestamp = $this->safe_timestamp($ticker, 'at');
        $symbol = $this->find_symbol($tickerSymbol, $market);
        $last = $this->safe_float($ticker, 'last');
        $open = $this->safe_float($ticker, 'open');
        $change = $last - $open;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'buy'),
            'bidVolume' => null,
            'ask' => $this->safe_float($ticker, 'sell'),
            'askVolume' => null,
            'vwap' => null,
            'open' => $open,
            'close' => $last,
            'last' => $last,
            'previousClose' => null,
            'change' => $change,
            'percentage' => ($change / $open) * 100,
            'average' => ($last . $open) / 2,
            'baseVolume' => $this->safe_float($ticker, 'vol'),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTickersMarketId (array_merge (array (
            'market_id' => $market['id'],
        ), $params));
        return $this->parse_ticker($response, $market['id'], $market);
    }

    public function parse_tickers ($rawTickers, $symbols = null) {
        $tickers = array();
        $tickerKeys = is_array($rawTickers) ? array_keys($rawTickers) : array();
        for ($i = 0; $i < count ($tickerKeys); $i++) {
            $key = $tickerKeys[$i];
            $rawTicker = $rawTickers[$key];
            $tickers[] = $this->parse_ticker($rawTicker, $key);
        }
        return $this->filter_by_array($tickers, 'symbol', $symbols);
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $rawTickers = $this->publicGetTickers ($params);
        return $this->parse_tickers ($rawTickers, $symbols);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0],
            floatval ($ohlcv[1]),
            floatval ($ohlcv[2]),
            floatval ($ohlcv[3]),
            floatval ($ohlcv[4]),
            floatval ($ohlcv[5]),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'market' => $market['id'],
            'period' => $this->timeframes[$timeframe],
        );
        if ($since !== null) {
            $request['timestamp'] = $since;
        }
        if ($limit !== null) {
            $request['limit'] = $limit; // default = 30
        }
        $response = $this->publicGetK (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function parse_deposit_address ($code, $response) {
        $depositAddress = null;
        if (strlen ($response) <= 1) {
            $depositAddress = $response[0];
        } else {
            // TODO for multiple deposit $address
            $depositAddress = $response[0];
        }
        $address = $this->safe_string($depositAddress, 'address');
        $tag = null;
        if ($code === 'XRP' && $address) {
            $splitted = explode('?dt=', $address);
            $address = $splitted[0];
            $tag = $splitted[1];
        }
        $this->check_address($address);
        return array (
            'info' => $response,
            'currency' => $code,
            'address' => $address,
            'tag' => $tag,
        );
    }

    public function create_deposit_address ($code, $params = array ()) {
        $this->load_markets();
        $currency = $this->currency ($code);
        $request = array (
            'currency' => $currency['id'],
        );
        $response = $this->privatePostDepositAddresses (array_merge ($request, $params));
        return $this->parse_deposit_address ($code, $response);
    }

    public function fetch_deposit_address ($code, $params = array ()) {
        $this->load_markets();
        $currency = $this->currency ($code);
        $request = array (
            'currency' => $currency['id'],
        );
        $response = $this->privateGetDepositAddresses (array_merge ($request, $params));
        return $this->parse_deposit_address ($code, $response);
    }

    public function parse_transaction_status_by_type ($status, $type = null) {
        if ($type === null) {
            return $status;
        }
        $statuses = array (
            'deposit' => array (
            ),
            'withdrawal' => array (
                'sent' => 'pending',
                'confirmed' => 'ok',
            ),
        );
        return (is_array($statuses[$type]) && array_key_exists($status, $statuses[$type])) ? $statuses[$type][$status] : $status;
    }

    public function parse_transaction ($transaction, $currency = null) {
        $id = $this->safe_string($transaction, 'uuid');
        $txid = $this->safe_string($transaction, 'txid');
        // var_dump ('currency', $currency);
        $currencyId = $this->safe_string($transaction, 'currency');
        $code = $this->safe_currency_code($currencyId, $currency);
        $timestamp = $this->safe_timestamp($transaction, 'created_at');
        $updated = $this->safe_timestamp($transaction, 'updated_at');
        $amount = $this->safe_float($transaction, 'amount');
        $feeCurrencyId = $this->safe_string($transaction, 'currency');
        $feeCurrency = null;
        if (is_array($this->currencies_by_id) && array_key_exists($feeCurrencyId, $this->currencies_by_id)) {
            $feeCurrency = $this->currencies_by_id[$feeCurrencyId];
        }
        if ($feeCurrency !== null) {
            $feeCurrencyId = $feeCurrency['code'];
        } else {
            $feeCurrencyId = $this->safe_currency_code($feeCurrencyId);
        }
        $fee = array (
            'cost' => $this->safe_float($transaction, 'fee'),
            'currency' => $feeCurrencyId,
        );
        // TODO $type
        $type = 'withdrawal';
        $status = $this->parse_transaction_status_by_type ($this->safe_string($transaction, 'state'), $type);
        return array (
            'info' => $transaction,
            'id' => $id,
            'txid' => $txid,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'address' => null,
            'tag' => null,
            'type' => $type,
            'amount' => $amount,
            'currency' => $code,
            'status' => $status,
            'updated' => $updated,
            'fee' => $fee,
        );
    }

    public function fetch_withdrawals ($code = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $currency = null;
        $request = array();
        if ($code !== null) {
            $currency = $this->currency ($code);
            $request['currency'] = $currency['id'];
        }
        // timestamp : the seconds elapsed $since Unix epoch, set to return trades executed before the time only
        // if (timestamp !== null) {
        //     $request['timestamp'] = timestamp;
        // }
        $response = $this->privateGetWithdrawals (array_merge ($request, $params));
        return $this->parse_transactions($response, $currency, $since, $limit);
    }

    public function fetch_deposits ($code = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $currency = null;
        $request = array();
        if ($code !== null) {
            $currency = $this->currency ($code);
            $request['currency'] = $currency['id'];
        }
        $response = $this->privateGetWithdrawals (array_merge ($request, $params));
        return $this->parse_transactions($response, $currency, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        //
        // public trades
        //
        //    {
        //        "$id" => 4813073,
        //        "$price" => "3980.0",
        //        "volume" => "0.000264",
        //        "funds" => "1.05072",
        //        "$market" => "btcusdt",
        //        "market_name" => "BTC/USDT",
        //        "created_at" => 1553341297,
        //        "$side" => "bid"
        //    }
        //
        //
        // private trades
        //
        //    {
        //        "$id" => 3175037,
        //        "$price" => "3986.97",
        //        "volume" => "0.125",
        //        "funds" => "498.37125",
        //        "$market" => "btcusdt",
        //        "market_name" => "BTC/USDT",
        //        "created_at" => 1543941724,
        //        "$side" => "ask",
        //        "$fee" => "0.747557",
        //        "fee_currency" => "usdt",
        //        "order_id" => 18298466
        //    }
        $timestamp = $this->safe_timestamp($trade, 'created_at');
        $price = $this->safe_float($trade, 'price');
        $amount = $this->safe_float($trade, 'volume');
        $id = $this->safe_integer($trade, 'id');
        $side = $this->safe_string($trade, 'side');
        $order = $this->safe_string($trade, 'order_id');
        $fee = null;
        if (is_array($trade) && array_key_exists('fee', $trade)) {
            $fee = array (
                'cost' => $this->safe_float($trade, 'fee'),
                'currency' => $this->safe_currency_code($trade['fee_currency']),
            );
        }
        $takerOrMaker = null; // TODO $takerOrMaker
        $symbol = null;
        if ($market === null) {
            $marketId = $this->safe_string($trade, 'market');
            $market = $this->safe_value($this->markets_by_id, $marketId);
        }
        if ($market !== null) {
            $symbol = $market['symbol'];
        }
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'id' => $id,
            'order' => $order,
            'type' => null,
            'takerOrMaker' => $takerOrMaker,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
            'cost' => $price * $amount,
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'market' => $market['id'],
        );
        // timestamp : the seconds elapsed $since Unix epoch, set to return trades executed before the time only
        // if (timestamp !== null) {
        //     $request['timestamp'] = timestamp;
        // }
        if ($limit !== null) {
            $request['limit'] = $limit; // default = 50, maximum = 1000
        }
        $response = $this->publicGetTrades (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if ($symbol === null) {
            throw new ArgumentsRequired($this->id . ' fetchMyTrades requires a $symbol argument');
        }
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'market' => $market['id'],
        );
        if ($limit !== null) {
            $request['limit'] = $limit;
        }
        // timestamp : the seconds elapsed $since Unix epoch, set to return trades executed before the time only
        // if ($since !== null)
        //     $request['timestamp'] = $since;
        $response = $this->privateGetTradesMy (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function parse_order_status ($status) {
        $statuses = array (
            'wait' => 'open',
            'cancel' => 'canceled',
            'done' => 'closed',
            'convert' => 'open', // TODO
            'finalizing' => 'open', // TODO
            'failed' => 'canceled', // TODO
        );
        return (is_array($statuses) && array_key_exists($status, $statuses)) ? $statuses[$status] : $status;
    }

    public function parse_order ($order) {
        $status = $this->parse_order_status($this->safe_string($order, 'state'));
        $symbol = $this->find_symbol($this->safe_string($order, 'market'));
        $timestamp = $this->safe_timestamp($order, 'created_at');
        $lastTradeTimestamp = $this->safe_timestamp($order, 'updated_at');
        $id = $this->safe_integer($order, 'id');
        $price = $this->safe_float($order, 'price');
        $amount = $this->safe_float($order, 'volume');
        $average = $this->safe_float($order, 'avg_price');
        $filled = $this->safe_float($order, 'executed_volume');
        $cost = null;
        $remaining = $this->safe_float($order, 'remaining_volume');
        $type = $this->safe_string($order, 'ord_type');
        if ($type !== null) {
            if ($type === 'market') {
                if ($price === null) {
                    $price = $average;
                }
            }
        }
        if ($price !== null) {
            $cost = $price * $filled;
        }
        $side = $this->safe_string($order, 'side');
        $result = array (
            'info' => $order,
            'id' => $id,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'lastTradeTimestamp' => $lastTradeTimestamp,
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
            'cost' => $cost,
            'average' => $average,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => null, // TODO fee of $order
            'trades' => null, // TODO trades of $order
        );
        return $result;
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $order = array (
            'market' => $market['id'],
            'volume' => $this->amount_to_precision($symbol, $amount),
            'ord_type' => $type,
            'side' => $side,
        );
        $priceIsRequired = false;
        $stopPriceIsRequired = false;
        if ($type === 'limit' || $type === 'stop_limit') {
            $priceIsRequired = true;
        }
        if ($type === 'stop_limit' || $type === 'stop_market') {
            $stopPriceIsRequired = true;
        }
        if ($priceIsRequired) {
            if ($price === null) {
                throw new InvalidOrder($this->id . ' createOrder method requires a $price argument for a ' . $type . ' order');
            }
            $order['price'] = $this->price_to_precision($symbol, $price);
        }
        if ($stopPriceIsRequired) {
            $stopPrice = $this->safe_float($params, 'stopPrice');
            if ($stopPrice === null) {
                throw new InvalidOrder($this->id . ' createOrder method requires a $stopPrice extra param for a ' . $type . ' order');
            }
            $params = $this->omit ($params, 'stopPrice');
            $order['stopPrice'] = $this->price_to_precision($symbol, $stopPrice);
        }
        $response = $this->privatePostOrders (array_merge ($order, $params));
        return $this->parse_order($response, $market);
    }

    public function cancel_all_orders ($symbol = null, $params = array ()) {
        $request = array();
        if ($symbol !== null) {
            $this->load_markets();
            $market = $this->market ($symbol);
            $request['market'] = $market['id'];
        }
        return $this->privatePostOrdersClear (array_merge ($request, $params));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $request = array (
            'id' => $id,
        );
        $response = $this->privatePostOrderDelete (array_merge ($request, $params));
        return $this->parse_order($response);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        if ($id === null) {
            throw new ArgumentsRequired($this->id . ' fetchOrder requires a $id argument');
        }
        $this->load_markets();
        $request = array (
            'id' => $id,
        );
        $response = $this->privateGetOrder ($request);
        return $this->parse_order($response);
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if ($symbol === null) {
            throw new ArgumentsRequired($this->id . ' fetchOrders requires a $symbol argument');
        }
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'market' => $market['id'],
        );
        if ($limit !== null) {
            $request['limit'] = $limit;
        }
        $response = $this->privateGetOrders (array_merge ($request, $params));
        return $this->parse_orders($response, $market, null, $limit);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_orders($symbol, $since, $limit, array_merge ($params, array( 'state' => 'done' )));
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_orders($symbol, $since, $limit, array_merge ($params, array( 'state' => 'wait' )));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $newParams = $params;
        $request = '/api/' . $this->version . '/' . $this->implode_params($path, $params);
        $url = $this->urls['api'][$api];
        $url .= $request;
        if ($api === 'private') {
            $this->check_required_credentials();
            $newParams = array_merge ($params, array (
                'nonce' => $this->nonce (),
                'path' => $request,
            ));
            $payload = base64_encode ($this->json ($newParams));
            $signature = $this->hmac ($payload, $this->secret);
            if (!$headers) {
                $headers = array();
            }
            $headers = array_merge ($headers, array (
                'X-MAX-ACCESSKEY' => $this->apiKey,
                'X-MAX-PAYLOAD' => $payload,
                'X-MAX-SIGNATURE' => $signature,
            ));
        }
        if ($method === 'GET' || $method === 'DELETE') {
            if ($newParams) {
                $url .= '?' . $this->urlencode ($newParams);
            }
        } else {
            $body = $this->json ($newParams);
            if (!$headers) {
                $headers = array();
            }
            $headers = array_merge ($headers, array (
                'Content-Type' => 'application/json',
            ));
        }
        return array (
            'url' => $url,
            'method' => $method,
            'body' => $body,
            'headers' => $headers,
        );
    }

    public function handle_errors ($httpCode, $reason, $url, $method, $headers, $body, $response, $requestHeaders, $requestBody) {
        if ($response === null) {
            return; // fallback to default $error handler
        }
        $error = $this->safe_string($response, 'error');
        if (gettype ($error) === 'string') {
            return;
        }
        $code = $error && $this->safe_string($error, 'code');
        if ($code) {
            $feedback = $this->id . ' ' . $this->safe_string($error, 'message');
            if (is_array($this->exceptions) && array_key_exists($code, $this->exceptions)) {
                throw new $this->exceptions[$code]($feedback);
            } else {
                throw new ExchangeError($feedback);
            }
        }
    }
}
