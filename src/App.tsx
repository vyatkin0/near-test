import React from 'react';
import * as nearAPI from 'near-api-js';
import SelectMarket, { MarketInfo } from './components/SelectMarket';
import MarketTable, { MarketProps } from './components/Market';

import './App.css';

type MarketContract = nearAPI.Contract & { markets: Function, view_market: Function };

const { connect, keyStores, WalletConnection, Contract, utils } = nearAPI;

const connectionConfig = {
    networkId: 'testnet',
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
};

async function onSignIn() {
    const nearConnection = await connect(connectionConfig);
    const walletConnection = new WalletConnection(nearConnection, 'near-test');
    walletConnection.requestSignIn({});
}

export default function App() {

    const [account, setAccount] = React.useState<nearAPI.ConnectedWalletAccount>();
    const [balance, setBalance] = React.useState('');
    const [contract, setContract] = React.useState<MarketContract>();
    const [marketsList, setMarketsList] = React.useState<MarketInfo[]>();
    const [market, setMarket] = React.useState<MarketProps>();

    React.useEffect(() => {
        connect(connectionConfig).then(async (nearConnection) => {
            const walletConnection = new WalletConnection(nearConnection, 'near-test');
            if (walletConnection.isSignedIn()) {
                const a = walletConnection.account();
                setAccount(a);
                if (a) {
                    const accountBalance = await a.getAccountBalance();
                    const b = accountBalance ? utils.format.formatNearAmount(accountBalance.total, 8) : '';
                    setBalance(b);

                    const c = new Contract(
                        a,
                        'app_2.spin_swap.testnet',
                        {
                            viewMethods: ['markets', 'view_market'],
                            changeMethods: [],
                        }
                    ) as MarketContract;

                    setContract(c);
                }
                else {
                    setContract(undefined);
                    setBalance('');
                }
            }
        });
    }, [setContract, setBalance]);

    const onSignOut = React.useCallback(async () => {
        const nearConnection = await connect(connectionConfig);
        const walletConnection = new WalletConnection(nearConnection, 'near-test');
        if (walletConnection.isSignedIn()) {
            walletConnection.signOut();
        }
        setBalance('');
        setAccount(undefined);
        setContract(undefined);
        setMarketsList(undefined);
        setMarket(undefined);
    }, [setAccount, setContract, setBalance]);

    const onContract = React.useCallback(async () => {
        if (!contract) {
            return;
        }

        setMarket(undefined);
        setMarketsList(undefined);

        const markets = await contract.markets({});

        setMarketsList(markets);
    }, [contract, setMarketsList]);

    const onMarketChanged = React.useCallback(async (id?: number) => {
        if (!contract) {
            return;
        }

        const market = id ? await contract.view_market({ 'market_id': id }) : undefined;
        market.ask_orders.reverse();
        setMarket(market);
    }, [contract, setMarket]);

    if (!account) {
        return <main>
            <button onClick={onSignIn}>SignIn</button>
        </main>;
    }

    return (
        <main>
            <h2>wallet: {account.accountId}</h2>
            <h3>total: {balance}</h3>
            <button onClick={onContract} disabled={!contract}>Call Contract</button>
            {marketsList && <SelectMarket markets={marketsList} onChanged={onMarketChanged}></SelectMarket>}
            {market && <MarketTable {...market}></MarketTable>}
            <button onClick={onSignOut}>SignOut</button>
        </main>
    );
}