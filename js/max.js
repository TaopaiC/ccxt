'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError, InvalidAddress } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

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
                'CORS': false,
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
                'fetchDeposits': true,
                'fetchFundingFees': true,
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
                'fetchOrderTrades': false,
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
                'public': {
                    'get': [
                        'summary',
                        'markets',
                        'currencies',
                        'tickers/{market_id}',
                        'tickers',
                        'withdrawal/constraint',
                        'depth',
                        'trades',
                        'k',
                        'timestamp',
                        'vip_levels',
                        'vip_levels/{level}',
                    ],
                },
                'private': {
                    'get': [
                        'members/profile',
                        'members/accounts/{currency_id}',
                        'members/accounts',
                        'members/vip_level',
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
                        'orders/multi/onebyone',
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
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.05 / 100,
                    'taker': 0.15 / 100,
                    'tiers': {
                        'taker': [
                            // volume in TWD
                            [0, 0.15 / 100],
                            [3000000, 0.135 / 100],
                            [10000000, 0.12 / 100],
                            [30000000, 0.105 / 100],
                            [150000000, 0.09 / 100],
                            [300000000, 0.075 / 100],
                            [600000000, 0.06 / 100],
                        ],
                        'maker': [
                            // volume in TWD
                            [0, 0.05 / 100],
                            [3000000, 0.045 / 100],
                            [10000000, 0.04 / 100],
                            [30000000, 0.035 / 100],
                            [150000000, 0.03 / 100],
                            [300000000, 0.025 / 100],
                            [600000000, 0.02 / 100],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
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

    async fetchFundingFees (params = {}) {
        const response = await this.publicGetWithdrawalConstraint (params);
        //
        //     [
        //       {
        //          "currency": "eth",
        //          "fee": "0.002",
        //          "ratio": "0.0",
        //          "min_amount": "0.02"
        //        }
        //     ]
        //
        const withdrawFees = {};
        for (let i = 0; i < response.length; i++) {
            const id = this.safeValue (response[i], 'currency');
            const code = this.safeCurrencyCode (id);
            withdrawFees[code] = this.safeFloat (response[i], 'fee');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    async fetchCurrencies (params = {}) {
        const currenciesResponse = await this.publicGetCurrencies (params);
        const withdrawalConstraintResponse = await this.publicGetWithdrawalConstraint ();
        const withdrawalConstraint = this.indexBy (withdrawalConstraintResponse, 'currency');
        const result = {};
        for (let i = 0; i < currenciesResponse.length; i++) {
            const currency = currenciesResponse[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const fiat = id === 'twd' ? true : false;
            const precision = this.safeInteger (currency, 'precision');
            const withdrawal = this.safeValue (withdrawalConstraint, id);
            const withdrawalFee = this.safeValue (withdrawal, 'fee');
            const withdrawalLimit = this.safeValue (withdrawal, 'min_amount');
            const minAmount = this.safeFloat (this.options['minimumAmountOfCurrencies'], code);
            result[code] = {
                'id': id,
                'code': code,
                'name': code,
                'active': true, // TODO
                'fiat': fiat,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
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
        //
        //    {
        //      id: 'btcusdt',
        //      name: 'BTC/USDT',
        //      base_unit: 'btc',
        //      base_unit_precision: 6,
        //      min_base_amount: 0.001,
        //      quote_unit: 'usdt',
        //      quote_unit_precision: 2,
        //      min_quote_amount: 8.0
        //    }
        //
        const markets = await this.publicGetMarkets ();
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString(market, 'base_unit');
            const quoteId = this.safeString(market, 'quote_unit');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'base_unit_precision'),
                'price': this.safeInteger (market, 'quote_unit_precision'),
            };
            const active = true;
            const baseMinSize = this.safeFloat (market, 'min_base_amount');
            const quoteMinSize = this.safeFloat (market, 'min_quote_amount');
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
                        'min': baseMinSize,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': quoteMinSize,
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let key = 'quote';
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        const code = market[key];
        const currency = this.safeValue (this.currencies, code);
        if (currency !== undefined) {
            const precision = this.safeInteger (currency, 'precision');
            if (precision !== undefined) {
                cost = parseFloat (this.currencyToPrecision (code, cost));
            }
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersAccounts (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'locked');
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
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
        if (market !== undefined) {
            symbol = market['symbol'];
        } else if ('symbol' in ticker) {
            const marketId = this.safeString (ticker, 'symbol');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                    symbol = market['symbol'];
                }
            }
        }
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
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
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
        const statusesByType = {
            'deposit': {
                'submitting': 'pending',
                'cancelled': 'canceled',
                'submitted': 'pending',
                'suspended': 'pending',
                'rejected': 'failed',
                'accepted': 'ok',
                'checking': 'pending',
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
                'sygna_verifying': 'pending',
            },
        };
        const statuses = this.safeValue (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //   {
        //      currency: 'eth',
        //      currency_version: 'eth',
        //      amount: '1.12345',
        //      fee: '0.123',
        //      txid: '0x123456789abcdef...',
        //      created_at: 1584584162,
        //      updated_at: 1584584199,
        //      confirmations: '12',
        //      state: 'accepted',
        //      type: 'deposit'
        //    }
        //
        // fetchWithdrawals
        //
        //    {
        //      uuid: '0123456789...',
        //      currency: 'eth',
        //      currency_version: 'eth',
        //      amount: '1.12345',
        //      fee: '0.123',
        //      fee_currency: 'max',
        //      txid: '0x123456789abcdef...',
        //      created_at: 1597164616,
        //      updated_at: 1598847790,
        //      state: 'confirmed',
        //      type: 'withdrawal'
        //    }
        //
        const txid = this.safeString (transaction, 'txid');
        const id = this.safeString (transaction, 'uuid', txid);
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

    parseSide (side) {
        if (!side) {
            return undefined;
        }
        if (side === 'buy' || side === 'sell') {
            return side;
        }
        if (side === 'bid') {
            return 'buy';
        }
        if (side === 'ask') {
            return 'sell';
        }
        // self-trade
        return side;
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
        //        "created_at_in_ms": 1553341297000,
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
        //        "created_at_in_ms": 1543941724000,
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
        let takerOrMaker = undefined;
        if ('info' in trade) {
            const tradeInfo = this.safeValue (trade, 'info');
            const tradeMakerSide = this.safeString2 (tradeInfo, 'maker');
            if (tradeMakerSide !== undefined && side !== undefined) {
                takerOrMaker = (tradeMakerSide === side) ? 'maker' : 'taker';
            }    
        }
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': this.parseSide (side),
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

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'id': id,
            // 'client_oid': client_oid, // user specific order id in RFC 4122 format. only persist for 24 hours
        };
        const response = await this.privateGetTradesMyOfOrder (this.extend (request, params));
        return this.parseTrades (response);
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
            'clientOrderId': undefined,
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

