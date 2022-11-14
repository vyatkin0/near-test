
import React from 'react';
import classes from './Market.module.css';
import { utils } from 'near-api-js';

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

const row = (order: Order, cn: string, key: number) => <div className={classes.row + ' ' + cn} key={key}>
    <span>{formatNum(order.price, 4)}</span>
    <span>{formatNum(order.quantity, 4)}</span>
    <span>{(scaleNum(order.price) * scaleNum(order.quantity)).toFixed(2)}</span>
</div>;

const Market = (props: MarketProps) => {
    const divRef = React.useRef<HTMLDivElement | null>(null);
    const [titleWidth, setTitleWidth] = React.useState<number>();
    React.useEffect(() => {
        if (divRef.current) {
            setTitleWidth(divRef.current?.clientWidth - 20/*padding-right*/);
            window.requestAnimationFrame(() => {
                if (divRef.current) {
                    const y = (divRef.current.scrollHeight - divRef.current.clientHeight) / 2;
                    divRef.current?.scrollTo(0, y);
                }
            });
        }
    }, [setTitleWidth, props]);

    const spread = props.ask_orders[props.ask_orders.length - 1]?.price - props.bid_orders[0]?.price;
    const pspread = spread / props.bid_orders[0]?.price * 100;

    return <>
        <div className={classes.row + ' ' + classes.title} style={{ width: titleWidth }}>
            <span>Price</span><span>Size</span><span>Total</span>
        </div>
        <div className={classes.container} ref={divRef}>
            {props.ask_orders.map((order, i) => row(order, classes.ask, i))}
            {!!props.bid_orders.length && !!props.ask_orders.length &&
                <div className={classes.row + ' ' + classes.spread}>
                    <span>{formatNum(spread, 4)}</span>
                    <span>Spread</span>
                    <span>{pspread.toFixed(2)}%</span>
                </div>}
            {props.bid_orders.map((order, i) => row(order, classes.bid, i))}
        </div>
    </>
}

export default Market;