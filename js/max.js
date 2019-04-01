'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, InvalidAddress } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');
const { prop, asInteger, isNumber } = require ('./base/functions/type');

//  ---------------------------------------------------------------------------

module.exports = class max extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'max',
            'name': 'Max',
            'countries': [ 'TW' ],
            'rateLimit': 1200,
            'cretified': false,
            'has': {
                'CORS': true,
                'publicAPI': true,
                'privateAPI': true,

                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': true,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': '',
                'api': {
                    'web': 'https://max.maicoin.com',
                    'wapi': '',
                    'public': 'https://max-api.maicoin.com/api/v2',
                    'private': 'https://max-api.maicoin.com/api/v2',
                    // 'private': 'http://localhost:8080/',
                    // 'v2': 'https://max-api.maicoin.com/api/v2',
                },
                'www': 'https://max.maicoin.com',
                'doc': 'https://max.maicoin.com/documents/api',
                'fees': 'https://max.maicoin.com/docs/fees',
            },
            'api': {
                'web': {
                },
                'wapi': {
                },
                'public': {
                    'get': [
                        'markets',
                        'currencies',
                        'tickers/{market_id}',
                        'tickers',
                        'withdrawal/constraint',
                        'depth',
                        'trades',
                        'k',
                        'timestamp',
                    ],
                },
                'private': {
                    'get': [
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
                    ],
                    'post': [
                        'deposit_addresses',
                        'orders/clear',
                        'orders',
                        'orders/multi',
                        'order/delete',
                    ],
                },
            },
            'fees': {
                'trading': {
                },
                'funding': {
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
            'exceptions': {
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const serverTimestamp = await this.publicGetTimestamp ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - parseInt (serverTimestamp, 10) * 1000;
        return this.options['timeDifference'];
    }

    insertObjectsPropertyBy (a, keyA, b, keyB, insertKey) {
        const result = {};
        for (let i = 0; i < a.length; i++) {
            const entry = a[i];
            const index = entry[keyA];
            result[index] = entry;
        }
        for (let i = 0; i < b.length; i++) {
            const entry = b[i];
            const index = entry[keyB];
            if (result[index]) {
                result[index][insertKey] = entry;
            }
        }
        return Object.values (result);
    }

    async fetchCurrencies (params = {}) {
        const currenciesResponse = await this.publicGetCurrencies (params);
        const withdrawalResponse = await this.publicGetWithdrawalConstraint ();
        const response = this.insertObjectsPropertyBy (
            currenciesResponse,
            'id',
            withdrawalResponse,
            'currency',
            'withdrawal'
        );
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = currency['id'];
            const code = this.commonCurrencyCode (id).toUpperCase ();
            const fiat = id === 'twd' ? true : false;
            const withdrawal = this.safeValue (currency, 'withdrawal');
            const withdrawalFee = this.safeValue (withdrawal, 'fee');
            const withdrawalLimit = this.safeValue (withdrawal, 'min_amount');
            result[code] = {
                'id': id,
                'code': code,
                'name': code,
                'active': true,
                'fiat': fiat,
                'precision': this.safeInteger (currency, 'precision'),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': withdrawalLimit,
                        'max': undefined,
                    },
                },
                'funding': {
                    'withdraw': {
                        'fee': withdrawalFee,
                    },
                    'deposit': {
                        'fee': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarkets ();
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = market['id'];
            const baseId = market['base_unit'];
            const quoteId = market['quote_unit'];
            const base = this.commonCurrencyCode (baseId).toUpperCase ();
            const quote = this.commonCurrencyCode (quoteId).toUpperCase ();
            const symbol = base + '/' + quote;
            const precision = {
                'base': market['base_unit_precision'],
                'quote': market['quote_unit_precision'],
                // TODO 'amount'
                // TODO 'price
            };
            const active = true;
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                // TODO market.limits
            };
            result.push (entry);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersAccounts (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            let currency = balance['currency'];
            if (currency in this.currencies_by_id)
                currency = this.currencies_by_id[currency]['code'];
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'locked');
            account['total'] = account['free'] + account['used'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit; // default = 300
        const response = await this.publicGetDepth (this.extend (request, params));
        const timestamp = this.safeTimestampThousand (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, timestamp);
        return orderbook;
    }

    parseTicker (ticker, tickerSymbol, market = undefined) {
        const timestamp = this.safeTimestampThousand (ticker, 'at');
        const symbol = this.findSymbol (tickerSymbol, market);
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetTickersMarketId (this.extend ({
            'market_id': market['id'],
        }, params));
        return this.parseTicker (response, market['id'], market);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        Object.keys (rawTickers).forEach ((key) => {
            const rawTicker = rawTickers[key];
            tickers.push (this.parseTicker (rawTicker, key));
        });
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const rawTickers = await this.publicGetTickers (params);
        return this.parseTickers (rawTickers, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 30
        }
        const response = await this.publicGetK (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseDepositAddress (code, response) {
        let depositAddress = undefined;
        if (response.length <= 1) {
            depositAddress = response[0];
        } else {
            // TODO for multiple deposit address
            depositAddress = response[0];
        }
        let address = this.safeString (depositAddress, 'address');
        let tag = undefined;
        if (code === 'XRP' && address) {
          const splitted = address.split('?dt=');
          address = splitted[0];
          tag = splitted[1];
        }
        this.checkAddress (address);
        return {
            'info': response,
            'currency': code,
            'address': address,
            'tag': tag,
        };
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostDepositAddresses (this.extend (request, params));
        return this.parseDepositAddress (code, response);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetDepositAddresses (this.extend (request, params));
        return this.parseDepositAddress (code, response);
    }

    parseTransactionStatusByType (status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        const statuses = {
            'deposit': {
            },
            'withdrawal': {
                'sent': 'pending',
                'confirmed': 'ok',
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'uuid');
        const txid = this.safeString (transaction, 'txid');
        let code = undefined;
        console.log ('currency', currency);
        const currencyId = this.safeString (transaction, 'currency');
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        // TODO why?
        if (currency !== undefined) {
            code = currency['code'];
        }
        const timestamp = this.safeTimestampThousand (transaction, 'created_at');
        const updated = this.safeTimestampThousand (transaction, 'updated_at');
        const amount = this.safeFloat (transaction, 'amount');
        let feeCurrencyId = this.safeString (transaction, 'currency');
        let feeCurrency = undefined;
        if (feeCurrencyId in this.currencies_by_id) {
            feeCurrency = this.currencies_by_id[feeCurrencyId];
        }
        if (feeCurrency !== undefined) {
            feeCurrencyId = feeCurrency['code'];
        } else {
            feeCurrencyId = this.commonCurrencyCode (feeCurrencyId);
        }
        const fee = {
            'cost': this.safeFloat (transaction, 'fee'),
            'currency': feeCurrencyId,
        };
        // TODO type
        const type = 'withdrawal';
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'state'), type);
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        // timestamp : the seconds elapsed since Unix epoch, set to return trades executed before the time only
        // if (timestamp !== undefined) {
        //     request['timestamp'] = timestamp;
        // }
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    safeTimestampThousand (o, k, $default, n = asInteger (prop (o, k))) {
        return isNumber (n) ? n * 1000 : $default;
    }

    parseTrade (trade, market = undefined) {
        //
        // public trades
        //
        //    {
        //        "id": 4813073,
        //        "price": "3980.0",
        //        "volume": "0.000264",
        //        "funds": "1.05072",
        //        "market": "btcusdt",
        //        "market_name": "BTC/USDT",
        //        "created_at": 1553341297,
        //        "side": "bid"
        //    }
        //
        //
        // private trades
        //
        //    {
        //        "id": 3175037,
        //        "price": "3986.97",
        //        "volume": "0.125",
        //        "funds": "498.37125",
        //        "market": "btcusdt",
        //        "market_name": "BTC/USDT",
        //        "created_at": 1543941724,
        //        "side": "ask",
        //        "fee": "0.747557",
        //        "fee_currency": "usdt",
        //        "order_id": 18298466
        //    }
        const timestamp = this.safeTimestampThousand (trade, 'created_at');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        const id = this.safeInteger (trade, 'id');
        const side = this.safeString (trade, 'side');
        const order = this.safeString (trade, 'order_id');
        let fee = undefined;
        if ('fee' in trade) {
            fee = {
                'cost': this.safeFloat (trade, 'fee'),
                'currency': this.commonCurrencyCode (trade['fee_currency']),
            };
        }
        let takerOrMaker = undefined; // TODO takerOrMaker
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'market');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        // timestamp : the seconds elapsed since Unix epoch, set to return trades executed before the time only
        // if (timestamp !== undefined) {
        //     request['timestamp'] = timestamp;
        // }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 1000
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        // timestamp : the seconds elapsed since Unix epoch, set to return trades executed before the time only
        // if (since !== undefined)
        //     request['timestamp'] = since;
        const response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        let statuses = {
            'wait': 'open',
            'cancel': 'canceled',
            'done': 'closed',
            'convert': 'open', // TODO
            'finalizing': 'open', // TODO
            'failed': 'canceled', // TODO
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order) {
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const symbol = this.findSymbol (this.safeString (order, 'market'));
        const timestamp = this.safeTimestampThousand (order, 'created_at');
        const lastTradeTimestamp = this.safeTimestampThousand (order, 'updated_at');
        const id = this.safeInteger (order, 'id');
        let price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'volume');
        const average = this.safeFloat (order, 'avg_price');
        const filled = this.safeFloat (order, 'executed_volume');
        let cost = undefined;
        const remaining = this.safeFloat (order, 'remaining_volume');
        const type = this.safeString (order, 'ord_type');
        if (type !== undefined) {
            if (type === 'market') {
                if (price === undefined) {
                    price = average;
                }
            }
        }
        if (price !== undefined) {
            cost = price * filled;
        }
        const side = this.safeString (order, 'side');
        const result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined, // TODO fee of order
            'trades': undefined, // TODO trades of order
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const order = {
            'market': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            'ord_type': type,
            'side': side,
        };
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        if (type === 'limit' || type === 'stop_limit') {
            priceIsRequired = true;
        }
        if (type === 'stop_limit' || type === 'stop_market') {
            stopPriceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (stopPriceIsRequired) {
            const stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            }
            params = this.omit (params, 'stopPrice');
            order['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        }
        const response = await this.privatePostOrders (this.extend (order, params));
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        if (symbol !== undefined) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            request['market'] = market['id'];
        }
        return this.privatePostOrdersClear (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderDelete (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrder (id) {
        if (id === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a id argument');
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrder (request);
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, undefined, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend (params, { 'state': 'done' }));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend (params, { 'state': 'wait' }));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        console.log('sign in', {
            path,
            api,
            method,
            params,
            headers,
            body,
        });
        let url = this.urls['api'][api];
        url += '/' + this.implodeParams (path, params);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const payloadPath = url.replace (/^.*\/\/[^/]+/, '');
            const payload = this.stringToBase64 (this.json (this.extend ({
                'nonce': this.nonce (),
                'path': payloadPath,
            }, params)));
            const signature = this.hmac (payload, this.secret);
            headers = {
                'X-MAX-ACCESSKEY': this.apiKey,
                'X-MAX-PAYLOAD': payload,
                'X-MAX-SIGNATURE': signature,
            };
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
                console.log('....', this.urlencode (params));
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        console.log({
            url,
            method,
            headers,
            body,
        });
        return {
            'url': url,
            'method': method,
            'body': body,
            'headers': headers,
        };
    }
};

