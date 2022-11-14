import React from 'react';
import classes from './SelectMarket.module.css';

export interface MarketInfo {
    id: number;
    base: { ticker: string };
    quote: { ticker: string };
}

interface SelectMarketProps {
    selected?: number;
    markets: MarketInfo[];
    onChanged?: (market: number | undefined) => void;
}

const SelectMarket = (props: SelectMarketProps) => {
    const [isOpened, setOpened] = React.useState(false);

    const [selectedMarket, setSelectedMarket] = React.useState<number | undefined>(props.selected);

    const mainDivRef = React.useRef<HTMLDivElement>(null);

    const handleOutsideClick = React.useCallback((e: Event) => {
        if (mainDivRef.current && mainDivRef.current.contains(e.target as Node)) {
            return;
        }

        document.removeEventListener('click', handleOutsideClick, true);
        setOpened(false);
    }, [setOpened]);

    const handleUp = React.useCallback(() => {
        document.removeEventListener('click', handleOutsideClick, true);
        setOpened(false);
    }, [setOpened, handleOutsideClick]);

    const {onChanged} = props; 
    const handleSelect = React.useCallback((market: number) => {
        handleUp();

        setSelectedMarket(market);

        onChanged?.(market);
    }, [handleUp, setSelectedMarket, onChanged]);

    React.useEffect(() => {
        return () => document.removeEventListener('click', handleOutsideClick, true);
    }, [handleOutsideClick]);

    const dropdownList = React.useMemo(() =>
        <div className={classes.dropdown} id='markets-list' role='listbox' aria-label='Markets'>
            {props.markets.map((m) => {
                const selected = m.id===selectedMarket;
                return <button key={m.id} role='option' aria-selected={selected}
                    className={classes.item} onClick={() => handleSelect(m.id)}
                >
                    {m.base.ticker}/{m.quote.ticker}
                </button>
            })}</div>, [props.markets, selectedMarket, handleSelect]);

    function handleDown() {
        setOpened(true);
        document.addEventListener('click', handleOutsideClick, true);
    }

    function onKeyDown(event: React.KeyboardEvent) {
        switch (event.key) {
            case 'Enter':
                handleDown();
                event.stopPropagation();
                break;
            case 'Escape':
                handleUp();
                event.stopPropagation();
                break;
        }
    }

    const openerPath = isOpened ? 'M10 6L5 0L0 6 H10Z' : 'M10 0L5 6L0 0H10Z';
    const openerClick = isOpened ? handleUp : handleDown;
    const contentClass = isOpened ? classes.content + ' ' + classes.contentFocused : classes.content;
    const market = props.markets.find(m => m.id === selectedMarket);

    return <div className={classes.main} ref={mainDivRef}>
        <div
            className={contentClass}
            tabIndex={0}
            onKeyDown={onKeyDown}
            role='combobox'
            aria-labelledby='markets-label'
            aria-controls='markets-list'
            aria-expanded={isOpened}
        >
            {market ? <span>{market.base.ticker + '/' + market.quote.ticker}</span> : <span className={classes.title} id='markets-label'>Select Market</span>}
            <span className={classes.opener} onClick={openerClick} aria-haspopup='listbox' aria-controls='markets-list'>
                <svg width='10' height='6' xmlns='http://www.w3.org/2000/svg'><path d={openerPath} fill='currentColor'></path></svg>
            </span>
        </div>
        {isOpened && dropdownList}
    </div>;
};

export default SelectMarket;
