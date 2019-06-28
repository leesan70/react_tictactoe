import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const current = props.current;
  const win = props.win;
  return (
    <button className={"square".concat(current).concat(win)} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isWinSquare) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        current={this.props.current === i ? " current" : ""}
        win={isWinSquare ? " win" : ""}
      />
    );
  }

  render() {
    const winSquares = this.props.winSquares;
    return (
      <div>
        {[...Array(3).keys()].map((i) => {
            return (
              <div key={i} className="board-row">
                {[...Array(3).keys()].map((j) => {
                  return (
                    this.renderSquare(i * 3 + j, winSquares.includes(i * 3 + j)) 
                  )
                })}
              </div>
            )
          })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      ascending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history;
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        move: i,
      }]),
      stepNumber: this.state.stepNumber + 1,
      xIsNext: !this.state.xIsNext,
      ascending: this.state.ascending,
    });
  }

  jumpTo(step) {
    this.setState({
      history: this.state.history.slice(0, step + 1),
      stepNumber: step,
      xIsNext: step % 2 === 0,
      ascending: this.state.ascending,
    });
  }

  moveToRowCol(move) {
    const row = Math.floor(move / 3) + 1;
    const col = (move) % 3 + 1;
    return `(${row}, ${col})`;
  }

  toggleSort = () => {
    this.setState({
      ...this.state,
      ascending: !this.state.ascending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const { winner, winSquares } = calculateWinner(current.squares);
    let moves = history.map((step, move) => {
      const desc = move ?
        `Go to move # ${move} ${this.moveToRowCol(step.move)}` :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (!this.state.ascending) {
      moves = moves.slice(0).reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (current.squares.every(elem => elem !== null)){
      status = 'No Winner';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            current={current.move}
            winSquares={winSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={this.toggleSort}>
              {this.state.ascending ? "Asending order" : "Descending order"}
            </button>
          </div>
          <ol reversed={!this.state.ascending}>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winSquares: lines[i],
      };
    }
  }
  return {
    winner: null,
    winSquares: [],
  };
}
