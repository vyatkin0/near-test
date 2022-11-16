
import React from 'react';
import { utils } from 'near-api-js';

import classes from './Market.module.css';

interface Order {
    price: number;
    quantity: number;
}

export interface MarketProps {
    ask_orders: Order[];
    bid_orders: Order[];
}

function scaleNum(n: number) {
    return n / 10 ** utils.format.NEAR_NOMINATION_EXP;
}

function formatNum(n: number, scale?: number) {
    return scaleNum(n).toFixed(scale);
}

function Cell({ children }: React.PropsWithChildren) {
    return <span role='cell'>{children}</span>
}

function HeadCell({ children }: React.PropsWithChildren) {
    return <span role='columnheader'>{children}</span>
}

const row = (order: Order, cn: string, key: number) => <div className={classes.row + ' ' + cn} key={key} role='row'>
    <Cell>{formatNum(order.price, 4)}</Cell>
    <Cell>{formatNum(order.quantity, 4)}</Cell>
    <Cell>{(scaleNum(order.price) * scaleNum(order.quantity)).toFixed(2)}</Cell>
</div>;

const Market = (props: MarketProps) => {
    const divRef = React.useRef<HTMLDivElement | null>(null);
    const [titleWidth, setTitleWidth] = React.useState<number>();

    const { ask_orders, bid_orders } = props;

    React.useEffect(() => {
        if (divRef.current) {
            setTitleWidth(divRef.current.clientWidth - 20/*padding-right*/);
            const y = (divRef.current.scrollHeight - divRef.current.clientHeight) / 2;
            divRef.current.scrollTo(0, y);
        }
    }, [setTitleWidth, ask_orders, bid_orders]);

    const spread = ask_orders[ask_orders.length - 1]?.price - bid_orders[0]?.price;
    const pspread = spread / bid_orders[0]?.price * 100;

    let top, bottom;
    if (ask_orders.length > bid_orders.length) {
        bottom = <div style={{ height: (ask_orders.length - bid_orders.length) * 25/*.row height*/ }}></div>;
    } else if (ask_orders.length < bid_orders.length) {
        top = <div style={{ height: (bid_orders.length - ask_orders.length) * 25/*.row height*/ }}></div>;
    }

    return <div role='table'>
        <div className={classes.row + ' ' + classes.title} style={{ width: titleWidth }} role='rowheader'>
            <HeadCell>Price</HeadCell><HeadCell>Size</HeadCell><HeadCell>Total</HeadCell>
        </div>
        <div className={classes.container} ref={divRef} role='rowgroup'>
            {top}
            {ask_orders.map((order, i) => row(order, classes.ask, i))}
            {!!bid_orders.length && !!ask_orders.length &&
                <div className={classes.row + ' ' + classes.spread} role='rowheader'>
                    <Cell>{formatNum(spread, 4)}</Cell>
                    <Cell>Spread</Cell>
                    <Cell>{pspread.toFixed(2)}%</Cell>
                </div>}
            {bid_orders.map((order, i) => row(order, classes.bid, i))}
            {bottom}
        </div>
    </div>
}

export default Market;