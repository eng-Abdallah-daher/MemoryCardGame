import React, { Component } from 'react';
import './MemoryCardGame.css';
import flipSoundFile from './sounds/flip.mp3';
import matchSoundFile from './sounds/match.mp3';
import winSoundFile from './sounds/win.mp3';

const IMAGES = [
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image011.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image012.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image013.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image014.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image015.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image016.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image017.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image018.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image019.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image020.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image021.png', matched: false },
    { src: 'https://www.helpfulgames.com/nativeGames/memory/bilder/image022.png', matched: false }
];

class MemoryCardGame extends Component {
    timer = null;
    countdown_timer = null;

    constructor() {
        super();
        this.state = {
            cards: [],
            first: null,
            second: null,
            lock: false,
            moves: 0,
            time: 0,
            started: false,
            win: false,
            difficulty: 'easy',
            bmoves: null,
            btime: null,
            dark: false,
            restarttimer: null
        };
        this.flipsound = new Audio(flipSoundFile);
        this.matchsound = new Audio(matchSoundFile);
        this.winsound = new Audio(winSoundFile);
    }

    componentDidMount() {
        this.loadBestScore();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.countdown_timer);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.first && this.state.second && prevState.second !== this.state.second) {
            this.handleCardComparison();
        }
        if (!this.state.win && this.state.cards.length > 0) {
            this.checkWin();
        }
        if (prevState.difficulty !== this.state.difficulty) {
            this.loadBestScore();
        }
    }

    loadBestScore() {
        const { difficulty } = this.state;
        const bm = localStorage.getItem(`${difficulty}-moves`);
        const bt = localStorage.getItem(`${difficulty}-time`);
        this.setState({ bmoves: bm ? parseInt(bm) : null, btime: bt ? parseInt(bt) : null });
    }

    bestScore() {
        const { difficulty, moves, time } = this.state;
        const bm = this.state.bmoves;
        const bt = this.state.btime;
        if (bm === null || moves < bm) {
            localStorage.setItem(`${difficulty}-moves`, moves);
            this.setState({ bmoves: moves });
        }
        if (bt === null || time < bt) {
            localStorage.setItem(`${difficulty}-time`, time);
            this.setState({ btime: time });
        }
    }

    isMatch = (a, b) => a.src === b.src;

    handleCardComparison = () => {
        const { first, second, cards } = this.state;
        this.setState({ lock: true }, () => {
            if (this.isMatch(first, second)) {
                this.matchsound.play().catch(() => { });
                const updated = cards.map(c => c.src === first.src ? { ...c, matched: true } : c);
                this.setState({ cards: updated }, this.resetSelection);
            } else {
                setTimeout(() => this.resetSelection(), 1000);
            }
        });
    }

    checkWin = () => {
        const { cards } = this.state;
        if (cards.length > 0 && cards.every(c => c.matched)) {
            this.setState({ win: true }, () => {
                clearInterval(this.timer);
                this.winsound.play().catch(() => { });
                this.bestScore();
                let count = 5;
                this.setState({ restarttimer: count });
                this.countdown_timer = setInterval(() => {
                    count--;
                    if (count <= 0) {
                        clearInterval(this.countdown_timer);
                        this.start();
                    } else {
                        this.setState({ restarttimer: count });
                    }
                }, 1000);
            });
        }
    }

    start = () => {
        clearInterval(this.timer);
        clearInterval(this.countdown_timer);
        const { difficulty } = this.state;
        const count = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 12;
        const base_IMAGES = IMAGES.slice(0, count);
        let list = [...base_IMAGES, ...base_IMAGES];
        list = this.shuffle(list);
        const mix = list.map((c, i) => ({ ...c, id: `${c.src}-${i}` }));
        this.setState({ cards: mix, first: null, second: null, lock: false, moves: 0, time: 0, started: true, win: false, restarttimer: null }, () => {
            this.timer = setInterval(() => this.setState(s => ({ time: s.time + 1 })), 1000);
        });
    }

    shuffle = (a) => {
        let i = a.length, j, t;
        while (i) {
            j = Math.floor(Math.random() * i--);
            t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    pick = (c) => {
        const { first, second, lock } = this.state;
        if (lock || c === first || c.matched) return;
        this.flipsound.play().catch(() => { });
        if (!first) this.setState({ first: c });
        else if (!second) this.setState({ second: c, lock: true });
    }

    resetSelection = () => {
        this.setState(s => ({ first: null, second: null, moves: s.moves + 1, lock: false }));
    }

    toggleTheme = () => this.setState(s => ({ dark: !s.dark }));

    setDifficulty = (d) => this.setState({ difficulty: d });

    render() {
        const { cards, first, second, moves, time, win, started, difficulty, bmoves, btime, dark, restarttimer } = this.state;
        return (
            <div className={dark ? 'page dark' : 'page'}>
                <div className="box">
                    <h1 tabIndex={0}>Memory Game</h1>
                    {!started && <div>
                        <button onClick={() => this.setDifficulty('easy')} style={{ opacity: difficulty === 'easy' ? 1 : 0.6 }}>Easy</button>
                        <button onClick={() => this.setDifficulty('medium')} style={{ opacity: difficulty === 'medium' ? 1 : 0.6 }}>Medium</button>
                        <button onClick={() => this.setDifficulty('hard')} style={{ opacity: difficulty === 'hard' ? 1 : 0.6 }}>Hard</button>
                    </div>}
                    <button onClick={this.start}>{started ? 'Restart' : 'Start'} Game</button>
                    <button onClick={this.toggleTheme}>{dark ? 'Light Mode' : 'Dark Mode'}</button>
                    <div className="info" tabIndex={0}>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
                    <div className="info" tabIndex={0}>Moves: {moves} | Time: {time}s</div>
                    {bmoves != null && <div className="info" tabIndex={0}>Best Moves: {bmoves} | Best Time: {btime}s</div>}
                    {win && <div className="info" style={{ color: 'green', fontWeight: 'bold' }} tabIndex={0}>You win!{restarttimer != null && ` Restarting in ${restarttimer}s...`}</div>}
                    <div className="grid" style={{ gridTemplateColumns: difficulty === 'hard' ? 'repeat(6,120px)' : 'repeat(4,120px)' }}>
                        {cards.map(card => <Card key={card.id} card={card} isFlipped={card === first || card === second || card.matched} onClick={() => this.pick(card)} />)}
                    </div>
                </div>
            </div>
        );
    }
}

const Card = ({ card, isFlipped, onClick }) => (
    <div className={`card${isFlipped ? ' flipped' : ''}`} onClick={onClick} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !card.matched) { e.preventDefault(); onClick(); } }} tabIndex={0} role="button" aria-label={card.matched ? `Card matched` : `${isFlipped ? 'Card open' : 'Hidden card'}`}>
        <div className="front"><img src={card.src} alt="" /></div>
        <div className="back">?</div>
    </div>
);

export default MemoryCardGame;