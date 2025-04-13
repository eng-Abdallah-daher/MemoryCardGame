import React, { Component } from 'react';
import './MemoryCardGame.css';

const IMAGES = [
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image015.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image040.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image027.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image030.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image006.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image008.png', matched: false }
];

class MemoryCardGame extends Component {
    timer = null;
    constructor() {
        super();
        this.state = {
            cards: [],
            one: null,
            two: null,
            lock: false,
            moves: 0,
            time: 0,
            started: false,
            win: false
        };
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.one && this.state.two && prevState.two !== this.state.two) {
            this.handleCardComparison();
        }
        if (!this.state.win && this.state.cards.length > 0) {
            this.checkWin();
        }
    }

    isMatch = (card1, card2) => {
        return card1.src === card2.src;
    }

    handleCardComparison = () => {
        const { one, two, cards } = this.state;
        this.setState({ lock: true }, () => {
            if (this.isMatch(one, two)) {
                const updatedCards = cards.map(card =>
                    card.src === one.src ? { ...card, matched: true } : card
                );
                this.setState({ cards: updatedCards }, this.resetSelection);
            } else {
                setTimeout(this.resetSelection, 1000);
            }
        });
    }

    checkWin = () => {
        const { cards } = this.state;
        const allMatched = cards.length > 0 && cards.every(card => card.matched);
        if (allMatched) {
            this.setState({ win: true });
            clearInterval(this.timer);
        }
    }

    start = () => {
        clearInterval(this.timer);
        let list = [...IMAGES, ...IMAGES];
        list = this.shuffle(list);
        const mix = list.map((c, index) => ({ ...c, id: `${c.src}-${index}` }));
        this.setState({
            cards: mix,
            one: null,
            two: null,
            lock: false,
            moves: 0,
            time: 0,
            started: true,
            win: false
        }, () => {
            this.timer = setInterval(() => {
                this.setState(state => ({ time: state.time + 1 }));
            }, 1000);
        });
    }

    shuffle = (array) => {
        let currentIndex = array.length;
        let randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    pick = (card) => {
        const { one, two, lock } = this.state;
        if (lock || card === one || card.matched) return;
        if (!one) {
            this.setState({ one: card });
        } else if (!two) {
            this.setState({ two: card, lock: true });
        }
    }

    resetSelection = () => {
        this.setState(state => ({
            one: null,
            two: null,
            moves: state.moves + 1,
            lock: false
        }));
    }

    render() {
        const { cards, one, two, moves, time, win } = this.state;
        return (
            <div className="page">
                <div className="box">
                    <h1 tabIndex={0}>Memory Game</h1>
                    <button onClick={this.start}>New Game</button>
                    <div className="info" tabIndex={0}>Moves: {moves} | Time: {time}s</div>
                    {win && <div className="info" style={{ color: 'green', fontWeight: 'bold' }} tabIndex={0}>You win!</div>}
                    <div className="grid">
                        {cards.map(card => (
                            <Card
                                key={card.id}
                                card={card}
                                isFlipped={card === one || card === two || card.matched}
                                onClick={() => this.pick(card)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

const Card = ({ card, isFlipped, onClick }) => (
    <div
        className={`card${isFlipped ? ' flipped' : ''}${card.matched ? ' matched' : ''}`}
        onClick={onClick}
        onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !card.matched) {
                e.preventDefault();
                onClick();
            }
        }}
        tabIndex={card.matched ? 0 : 0}
        role="button"
        aria-label={
            card.matched
                ? `Card matched: ${card.src.split('/').pop()}`
                : isFlipped
                    ? `Card open: ${card.src.split('/').pop()}`
                    : 'Hidden card'
        }
    >
        <div className="front">
            <img src={card.src} alt="" />
        </div>
        <div className="back">?</div>
    </div>
);

export default MemoryCardGame;
