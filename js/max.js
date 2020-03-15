'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError, InvalidAddress } = require ('./base/errors');

module.exports = class max extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'max',
            'name': 'Max',
            'countries': [ 'TW' ],
            'version': 'v2',
            'enableRateLimit': false,
            'rateLimit': 1200,
            'certified': false,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': true,
                'createDepositAddress': true,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': false,
                'editOrder': 'emulated',
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': false,
            },
            'urls': {
                'logo': '',
                'api': {
                    'web': 'https://max.maicoin.com',
                    'wapi': '',
                    'public': 'https://max-api.maicoin.com',
                    'private': 'https://max-api.maicoin.com',
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
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'fees': {
                'trading': {
                    'maker': 0.05 / 100,
                    'taker': 0.15 / 100,
                },
                'funding': {
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and Max clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
            'exceptions': {
                '2002': InvalidOrder, // Order volume too small
                '2003': OrderNotFound, // Failed to cancel order
                '2004': OrderNotFound, // Order doesn't exist
                '2005': AuthenticationError, // Signature is incorrect.
                '2006': AuthenticationError, // The nonce has already been used by access key.
                '2007': AuthenticationError, // The nonce is invalid. (30 secconds difference from server time)
                '2008': AuthenticationError, // The access key does not exist.
                '2009': AuthenticationError, // The access key is disabled.
                '2011': AuthenticationError, // Requested API is out of access key scopes.
                '2014': AuthenticationError, // Payload is not consistent with body or wrong path in payload.
                '2015': AuthenticationError, // Payload is invalid
                '2016': InvalidOrder, // amount_too_small
                '2018': InsufficientFunds, // cannot lock funds
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp ();
        return parseInt (response, 10) * 1000;
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const serverTimestamp = await this.fetchTime ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTimestamp;
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
        const values = [];
        const resultKeys = Object.keys (result);
        for (let i = 0; i < resultKeys.length; i++) {
            values.push (result[resultKeys[i]]);
        }
        return values;
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
            const code = this.safeCurrencyCode (id);
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
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': market['base_unit_precision'],
                'price': market['quote_unit_precision'],
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
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
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
            if (currency in this.currencies_by_id) {
                currency = this.currencies_by_id[currency]['code'];
            }
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'locked');
            account['total'] = this.sum (account['free'], account['used']);
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
        if (limit !== undefined) {
            request['limit'] = limit; // default = 300
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, timestamp);
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'at');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (ticker, 'open');
        const change = last - open;
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
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': (change / open) * 100,
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
        response['symbol'] = market['id'];
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickerKeys = Object.keys (response);
        const result = {};
        for (let i = 0; i < tickerKeys.length; i++) {
            const key = tickerKeys[i];
            response[key]['symbol'] = key;
            const ticker = this.parseTicker (response[key]);
            if (symbols === undefined || symbols.includes (ticker['symbol'])) {
                result[ticker['symbol']] = ticker;
            }
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseInt (ohlcv[0]) * 1000,
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
            request['timestamp'] = parseInt (since) / 1000;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 30
        }
        const response = await this.publicGetK (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseDepositAddress (code, response) {
        if (response.length < 1) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress ' + code + ' returned empty address.');
        }
        const depositAddress = response[0];
        let address = this.safeString (depositAddress, 'address');
        if (address === 'suspended') {
            throw new InvalidAddress (this.id + ' fetchDepositAddress ' + code + ' returned an suspended address.');
        }
        let tag = undefined;
        if (code === 'XRP' && address) {
            const splitted = address.split ('?dt=');
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
                'submitting': 'pending',
                'cancelled': 'canceled',
                'submitted': 'pending',
                'suspended': 'pending',
                'rejected': 'failed',
                'accepted': 'ok',
                'refunded': 'failed',
                'suspect': 'pending',
                'refund_cancelled': 'ok',
            },
            'withdrawal': {
                'submitting': 'pending',
                'submitted': 'pending',
                'rejected': 'failed',
                'accepted': 'pending',
                'suspect': 'pending',
                'approved': 'pending',
                'processing': 'pending',
                'retryable': 'pending',
                'sent': 'pending',
                'canceled': 'canceled',
                'failed': 'failed',
                'pending': 'pending',
                'confirmed': 'ok',
                'kgi_manually_processing': 'pending',
                'kgi_instruction_sent': 'pending',
                'kgi_manually_confirmed': 'ok',
                'kgi_possible_failed': 'pending',
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'uuid');
        const txid = this.safeString (transaction, 'txid');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'created_at');
        const updated = this.safeTimestamp (transaction, 'updated_at');
        const amount = this.safeFloat (transaction, 'amount');
        let feeCurrencyId = this.safeString (transaction, 'fee_currency');
        let feeCurrency = undefined;
        if (feeCurrencyId in this.currencies_by_id) {
            feeCurrency = this.currencies_by_id[feeCurrencyId];
        }
        if (feeCurrency !== undefined) {
            feeCurrencyId = feeCurrency['code'];
        } else {
            feeCurrencyId = this.safeCurrencyCode (feeCurrencyId);
        }
        const fee = {
            'cost': this.safeFloat (transaction, 'fee'),
            'currency': feeCurrencyId,
        };
        const type = this.safeString (transaction, 'type');
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
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = Math.floor (parseInt (since, 10) / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = Math.floor (parseInt (since, 10) / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'deposit';
        }
        return this.parseTransactions (response, currency, since, limit);
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
        //        "info": {
        //            "maker": "ask",
        //            "ask": {"fee": "0.747557", "fee_currency": "usdt", "order_id": 18298466},
        //            "bid": null
        //        }
        //    }
        const timestamp = this.safeTimestamp (trade, 'created_at');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        const id = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'side');
        const order = this.safeString (trade, 'order_id');
        const cost = this.safeFloat (trade, 'funds');
        let fee = undefined;
        if ('fee' in trade) {
            fee = {
                'cost': this.safeFloat (trade, 'fee'),
                'currency': this.safeCurrencyCode (trade['fee_currency']),
            };
        }
        const tradeInfo = this.safeValue (trade, 'info');
        const tradeMakerSide = this.safeString2 (tradeInfo, 'maker');
        let takerOrMaker = undefined;
        if (tradeMakerSide !== undefined && side !== undefined) {
            takerOrMaker = (tradeMakerSide === side) ? 'maker' : 'taker';
        }
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
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        // since is not supported
        // if (since !== undefined) {
        //     request['timestamp'] = Math.floor (parseInt (since, 10) / 1000);
        // }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 1000
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // since is not supported
        // if (since !== undefined) {
        //     request['timestamp'] = Math.floor (parseInt (since, 10) / 1000);
        // }
        const response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'cancel': 'canceled',
            'done': 'closed',
            'convert': 'open',
            'finalizing': 'open',
            'failed': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (order, 'created_at');
        const id = this.safeString (order, 'id');
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
            'lastTradeTimestamp': undefined,
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
            'fee': undefined,
            'trades': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseType = type.toLowerCase ();
        const order = {
            'market': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            'ord_type': lowercaseType,
            'side': side,
        };
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        if (lowercaseType === 'limit' || lowercaseType === 'stop_limit') {
            priceIsRequired = true;
        }
        if (lowercaseType === 'stop_limit' || lowercaseType === 'stop_market') {
            stopPriceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + lowercaseType + ' order');
            }
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (stopPriceIsRequired) {
            const stop_price = this.safeFloat (params, 'stop_price');
            if (stop_price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stop_price extra param for a ' + lowercaseType + ' order');
            }
            params = this.omit (params, 'stop_price');
            order['stop_price'] = this.priceToPrecision (symbol, stop_price);
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a id argument');
        }
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrder (request);
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // since is not supported
        // if (since !== undefined) {
        //     request['timestamp'] = Math.floor (parseInt (since, 10) / 1000);
        // }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend (params, { 'state': ['cancel', 'done', 'failed'] }));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend (params, { 'state': ['wait', 'convert', 'finalizing'] }));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let newParams = params;
        const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api];
        url += request;
        if (!headers) {
            headers = {};
        }
        headers['X-MAX-AGENT'] = 'ccxt';
        if (api === 'private') {
            this.checkRequiredCredentials ();
            newParams = this.extend (params, {
                'nonce': this.nonce (),
                'path': request,
            });
            const payload = this.stringToBase64 (this.encode (this.json (newParams)));
            const signature = this.hmac (payload, this.encode (this.secret));
            headers = this.extend (headers, {
                'X-MAX-ACCESSKEY': this.apiKey,
                'X-MAX-PAYLOAD': this.decode (payload),
                'X-MAX-SIGNATURE': signature,
            });
        }
        if (method === 'GET' || method === 'DELETE') {
            if (!this.isEmpty (newParams)) {
                const newParamsIsArray = {};
                const newParamsOthers = {};
                const newParamsKeys = Object.keys (newParams);
                for (let i = 0; i < newParamsKeys.length; i++) {
                    const key = newParamsKeys[i];
                    if (Array.isArray (newParams[key])) {
                        newParamsIsArray[key] = newParams[key];
                    } else {
                        newParamsOthers[key] = newParams[key];
                    }
                }
                url += '?';
                if (!this.isEmpty (newParamsOthers)) {
                    url += this.urlencode (newParamsOthers);
                }
                if (!this.isEmpty (newParamsOthers) && !this.isEmpty (newParamsIsArray)) {
                    url += '&';
                }
                if (!this.isEmpty (newParamsIsArray)) {
                    const result = [];
                    const newParamsIsArrayKeys = Object.keys (newParamsIsArray);
                    for (let i = 0; i < newParamsIsArrayKeys.length; i++) {
                        const key = newParamsIsArrayKeys[i];
                        for (let j = 0; j < newParamsIsArray[key].length; j++) {
                            result.push (key + '%5B%5D=' + newParamsIsArray[key][j]);
                        }
                    }
                    url += result.join ('&');
                }
            }
        } else {
            body = this.json (newParams);
            headers = this.extend (headers, {
                'Content-Type': 'application/json',
            });
        }
        return {
            'url': url,
            'method': method,
            'body': body,
            'headers': headers,
        };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const error = this.safeValue (response, 'error');
        if (typeof error === 'string') {
            return;
        }
        const code = error && this.safeString (error, 'code');
        if (code) {
            const feedback = this.id + ' ' + this.safeString (error, 'message');
            if (code in this.exceptions) {
                throw new this.exceptions[code] (feedback);
            } else {
                throw new ExchangeError (feedback);
            }
        }
    }
};

