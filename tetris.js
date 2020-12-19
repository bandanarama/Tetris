document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    context.scale(20, 20);
    let counter = 0;
    let interval = 1000;
    let finalTime = 0;
    const colors = [ null,'orange', 'red', 'purple', 'green', 'blue','yellow', 'teal' ]
  
    function area() {
        let rowCount = 1;
        outer: for (let y = arena.length -1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            current.score += rowCount * 10;
            rowCount *= 2;
        }
    }

    function collide(arena, current) {
        const m = current.matrix;
        const o = current.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function create(width, height) {
        const matrix = [];
        while (height--) {
            matrix.push(new Array(width).fill(0));
        }
        return matrix;
    }

    function piece(type) {
        if (type === 'I') {
            return [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ];
        } else if (type === 'L') {
            return [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 2],
            ];
        } else if (type === 'J') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [3, 3, 0],
            ];
        } else if (type === 'O') {
            return [
                [4, 4],
                [4, 4],
            ];
        } else if (type === 'Z') {
            return [
                [5, 5, 0],
                [0, 5, 5],
                [0, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'T') {
            return [
                [0, 7, 0],
                [7, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(x + offset.x,
                                    y + offset.y,
                                    1, 1);
                }
            });
        });
    }

    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(arena, {x: 0, y: 0});
        drawMatrix(current.matrix, current.pos);
    }

    function merge(arena, current) {
        current.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + current.pos.y][x + current.pos.x] = value;
                }
            });
        });
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    function drop() {
        current.pos.y++;
        if (collide(arena, current)) {
            current.pos.y--;
            merge(arena, current);
            reset();
            area();
            updateScore();
        }
        counter = 0;
    }

    function move(offset) {
        current.pos.x += offset;
        if (collide(arena, current)) {
            current.pos.x -= offset;
        }
    }

    function reset() {
        const pieces = 'TJLOSZI';
        current.matrix = piece(pieces[pieces.length * Math.random() | 0]);
        current.pos.y = 0;
        current.pos.x = (arena[0].length / 2 | 0) -
                    (current.matrix[0].length / 2 | 0);
        if (collide(arena, current)) {
            arena.forEach(row => row.fill(0));
            current.score = 0;
            updateScore();
        }
    }

    function rotatePiece(dir) {
        const pos = current.pos.x;
        let offset = 1;
        rotate(current.matrix, dir);
        while (collide(arena, current)) {
            current.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > current.matrix[0].length) {
                rotate(current.matrix, -dir);
                current.pos.x = pos;
                return;
            }
        }
    }

    function update(time = 0) {
        const deltaTime = time - finalTime;
        counter += deltaTime;
        if (counter > interval) {
            drop();
        }
        finalTime = time;
        draw();
        requestAnimationFrame(update);
    }

    function updateScore() {
        document.getElementById('score').innerText = current.score;
    }

    document.addEventListener('keydown', event => {
        if (event.keyCode === 37) {
            move(-1);
        } else if (event.keyCode === 39) {
            move(1);
        } else if (event.keyCode === 40) {
            drop();
        } else if (event.keyCode === 81) {
            rotatePiece(-1);
        } else if (event.keyCode === 87) {
            rotatePiece(1);
        }
    });

    const arena = create(12, 20);

    const current = {
        pos: {x: 0, y: 0},
        matrix: null,
        score: 0,
    };

    reset();
    updateScore();
    update(); 
});