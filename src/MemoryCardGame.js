import React, { Component } from 'react';
import './MemoryCardGame.css';
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

        this.imgs = [
            { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image015.png', matched: false },
            { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image040.png', matched: false },
            { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image027.png', matched: false },
            { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image030.png', matched: false },
            { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image006.png', matched: false },
            { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image008.png', matched: false }
        ];
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    componentDidUpdate(prev1, prev) {
        const { one, two, cards, win } = this.state;
        if (one && two && prev.two !== two) {
            this.setState({ lock: true }, () => {
                if (one.src === two.src) {
                    this.setState({
                        cards: cards.map(c => c.src === one.src ? { ...c, matched: true } : c)
                    }, this.reset);
                } else {
                    setTimeout(this.reset, 1000);
                }
            });
        }
        if (!win) {
            let done = this.state.cards.length > 0 && this.state.cards.every(c => c.matched);
            if (done) {
                this.setState({ win: true });
                clearInterval(this.timer);
            }
        }
    }

    start = () => {
        clearInterval(this.timer);
        let list = [...this.imgs, ...this.imgs];
        list.sort(() => Math.random() - 0.5);
        let mix = list.map(c => ({ ...c, id: Math.random() }));

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
                this.setState(s => ({ time: s.time + 1 }));
            }, 1000);
        });
    }

    pick = c => {
        const { one, two, lock } = this.state;
        if (lock || c === one || c.matched) return;
        if (!one) {
            this.setState({ one: c });
        } else if (!two) {
            this.setState({ two: c });
        }
    }

    reset = () => {
        this.setState(s => ({
            one: null,
            two: null,
            moves: s.moves + 1,
            lock: false
        }));
    }

    render() {
        const { cards, one, two, moves, time, win } = this.state;
        return (
            <div className="page">
            

                <div className="box">
                    <h1>memory game</h1>
                    <button onClick={this.start}>new game</button>
                    <div className="info">moves: {moves} | time: {time}s</div>
                    {win && <div className="info" style={{ color: 'green', fontWeight: 'bold' }}>you win!</div>}

                    <div className="grid">
                        {cards.map(c => {
                            let flip = c === one || c === two || c.matched;
                            return (
                                <div key={c.id} className={`card${flip ? ' flipped' : ''}`} onClick={() => this.pick(c)}>
                                    <div className="front">
                                        <img src={c.src} alt="card" />
                                    </div>
                                    <div className="back">?</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default MemoryCardGame;
