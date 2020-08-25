// 横のサイズ
const bordX = 30;
// 縦のサイズ
const bordY = 40;
// Canvas
let canvas = $('#canvas');
// 説明枠
let description = $('#lblGen');

// 準備フラグ
var isReady = false;
// 開始フラグ
var isStart = false;

// 生死を表現する配列
var alive = new Array(bordY);
// 生存セルを数える配列
var board = new Array(bordY);
// 世代
var generation = 0;
// 位置情報配列
var vectors = new Array(bordY);

var initBoard;
var updateBoard;
var gameMode = "Original";

const msg = "Click on the game board!"

// ゲームモード選択
$('div[data-role="navbar"]').on('click', 'a', function (e) {
    gameMode = e.target.text;
});

// DOMが読み込まれたら実行させる
$(function () {
    // 初期化
    for (y = 0; y < bordY; y++) {
        alive[y] = new Array(bordX);
        board[y] = new Array(bordX);
        vectors[y] = new Array(bordX);
        for (x = 0; x < bordX; x++) {
            alive[y][x] = false;
            board[y][x] = 0;
            vectors[y][x] = { x: -1, y: -1, width: -1, height: -1 };
        }
    }
    // 盤面初期化
    initBoard = setInterval(clearBoard, 500);
    description.text(msg);
});

// 生存ボードの初期化
function clearBoard() {
    var board = new Array(bordX);
    var w = $('#mainContents').width();
    var h = $('#mainContents').height();
    canvas.attr('width', w);
    canvas.attr('height', h);
    if (canvas[0].getContext) {
        var ctx = canvas[0].getContext('2d');
        ctx.clearRect(0, 0, w, h);
        var cell_w = w / 30;
        var cell_h = h / 30;
        for (var y = 0; y < bordY; y++) {
            var offset_x = y % 2 == 0 ? cell_w / 2 : 0;
            var size_x = y % 2 == 0 ? (bordX - 1) : bordX;
            var hy = y * cell_h - (y - 1 >= 0 ? (cell_h / 4) * y : 0);
            for (var x = 0; x < size_x; x++) {
                var wx = x * cell_w + offset_x;
                vectors[y][x].x = wx + (cell_w / 2);
                vectors[y][x].y = hy + (cell_h / 2);
                vectors[y][x].width = cell_w;
                vectors[y][x].height = cell_h;
                strokeHexagon(ctx, vectors[y][x]);
            }
        }
        isReady = true;
    }
}

// 図形描画
function strokeHexagon(ctx, vec) {
    var wx = vec.x - (vec.width / 2);;
    var hy = vec.y - (vec.height / 2);
    var yp = vec.height / 4;
    var xp = vec.width / 2;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(wx + xp, hy);
    ctx.lineTo(wx + xp + xp, hy + yp);
    ctx.lineTo(wx + xp + xp, hy + yp + yp);
    ctx.lineTo(wx + xp, hy + yp + yp + yp);
    ctx.lineTo(wx, hy + yp + yp);
    ctx.lineTo(wx, hy + yp);
    ctx.closePath();
    ctx.fill();
}

// 図形の塗りつぶし
function fillHexagon(ctx, vec) {
    var wx = vec.x - (vec.width / 2);;
    var hy = vec.y - (vec.height / 2);
    var yp = vec.height / 4;
    var xp = vec.width / 2;
    ctx.fillStyle = "rgb(102, 179, 255)";
    ctx.beginPath();
    ctx.moveTo(wx + xp, hy);
    ctx.lineTo(wx + xp + xp, hy + yp);
    ctx.lineTo(wx + xp + xp, hy + yp + yp);
    ctx.lineTo(wx + xp, hy + yp + yp + yp);
    ctx.lineTo(wx, hy + yp + yp);
    ctx.lineTo(wx, hy + yp);
    ctx.closePath();
    ctx.fill();
}

// ライフゲームの開始トリガー
canvas[0].addEventListener("click", e => {
    if (!isReady || isStart) return;

    switch (gameMode) {
        case 'Original':
            gameModeOriginal(e);
            break;
        case 'Octagon':
            gameModeOctagon(e);
            break;
        case 'Nebula':
            gameModeNebula(e);
            break;
        case 'Glider':
            gameModeGlider(e);
            break;
    }
});

function gameModeOriginal(e) {
    const rect = canvas[0].getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    var hitX = -1;
    var hitY = -1;

    // 選択されたオブジェクトを探す
    search_loop:
    for (var y = 0; y < bordY; y++) {
        var size_x = y % 2 == 0 ? (bordX - 1) : bordX;
        for (var x = 0; x < size_x; x++) {
            var minX = vectors[y][x].x - (vectors[y][x].width / 2);
            var maxX = vectors[y][x].x + (vectors[y][x].width / 2);
            var minY = vectors[y][x].y - (vectors[y][x].height / 2);
            var maxY = vectors[y][x].y + (vectors[y][x].height / 2);

            if ((minX <= point.x && point.x <= maxX)
                && (minY <= point.y && point.y <= maxY)) {
                hitX = x;
                hitY = y;
                break search_loop;
            }
        }
    }

    // オブジェクトを塗りつぶす
    if (hitX >= 0 && hitY >= 0) {
        if (canvas[0].getContext) {
            var ctx = canvas[0].getContext('2d');
            fillAlive(ctx, hitX, hitY);
            var points = shakeAroundPoint(findAroundPoint(hitX, hitY));
            fillAlive(ctx, points[0].x, points[0].y);
            fillAlive(ctx, points[1].x, points[1].y);
            if (points.length > 1) {
                fillAlive(ctx, points[2].x, points[2].y);
            }
            isStart = true;
            clearInterval(initBoard);
            updateBoard = setInterval(update, 500);
        }
    }
}

function gameModeOctagon(e) {
    if (canvas[0].getContext) {
        var ctx = canvas[0].getContext('2d');
        fillAlive(ctx, 10, 12);
        fillAlive(ctx, 11, 12);
        fillAlive(ctx, 12, 12);
        fillAlive(ctx, 13, 12);
        fillAlive(ctx, 14, 12);
        fillAlive(ctx, 15, 12);
        fillAlive(ctx, 16, 12);
        fillAlive(ctx, 17, 12);
        fillAlive(ctx, 18, 12);
        fillAlive(ctx, 19, 12);
        fillAlive(ctx, 10, 30);
        fillAlive(ctx, 11, 30);
        fillAlive(ctx, 12, 30);
        fillAlive(ctx, 13, 30);
        fillAlive(ctx, 14, 30);
        fillAlive(ctx, 15, 30);
        fillAlive(ctx, 16, 30);
        fillAlive(ctx, 17, 30);
        fillAlive(ctx, 18, 30);
        fillAlive(ctx, 19, 30);
        fillAlive(ctx, 10, 13);
        fillAlive(ctx, 20, 13);
        fillAlive(ctx, 10, 29);
        fillAlive(ctx, 20, 29);
        fillAlive(ctx,  9, 14);
        fillAlive(ctx, 20, 14);
        fillAlive(ctx,  9, 28);
        fillAlive(ctx, 20, 28);
        fillAlive(ctx,  9, 15);
        fillAlive(ctx, 21, 15);
        fillAlive(ctx,  9, 27);
        fillAlive(ctx, 21, 27);
        fillAlive(ctx,  8, 16);
        fillAlive(ctx, 21, 16);
        fillAlive(ctx,  8, 26);
        fillAlive(ctx, 21, 26);
        fillAlive(ctx,  8, 17);
        fillAlive(ctx, 22, 17);
        fillAlive(ctx,  8, 25);
        fillAlive(ctx, 22, 25);
        fillAlive(ctx,  7, 18);
        fillAlive(ctx, 22, 18);
        fillAlive(ctx,  7, 24);
        fillAlive(ctx, 22, 24);
        fillAlive(ctx,  7, 19);
        fillAlive(ctx, 23, 19);
        fillAlive(ctx,  7, 20);
        fillAlive(ctx, 22, 20);
        fillAlive(ctx, 23, 21);
        fillAlive(ctx, 22, 22);
        fillAlive(ctx, 23, 23);
        fillAlive(ctx,  7, 21);
        fillAlive(ctx,  7, 22);
        fillAlive(ctx,  7, 23);
        isStart = true;
        clearInterval(initBoard);
        updateBoard = setInterval(update, 500);
    }
}

function gameModeNebula(e) {
    if (canvas[0].getContext) {
        var ctx = canvas[0].getContext('2d');
        fillAlive(ctx, 5, 12);
        fillAlive(ctx, 6, 12);
        fillAlive(ctx, 7, 12);
        fillAlive(ctx, 8, 12);
        fillAlive(ctx, 6, 13);
        fillAlive(ctx, 7, 13);
        fillAlive(ctx, 8, 13);
        fillAlive(ctx, 5, 14);
        fillAlive(ctx, 6, 14);
        fillAlive(ctx, 7, 14);
        fillAlive(ctx, 8, 14);
        fillAlive(ctx, 6, 15);
        fillAlive(ctx, 7, 15);
        fillAlive(ctx, 8, 15);
        fillAlive(ctx, 5, 16);
        fillAlive(ctx, 6, 16);
        fillAlive(ctx, 7, 16);
        fillAlive(ctx, 8, 16);
        fillAlive(ctx, 6, 17);
        fillAlive(ctx, 7, 17);
        fillAlive(ctx, 8, 17);
        fillAlive(ctx, 5, 18);
        fillAlive(ctx, 6, 18);
        fillAlive(ctx, 7, 18);
        fillAlive(ctx, 8, 18);
        fillAlive(ctx, 6, 19);
        fillAlive(ctx, 7, 19);
        fillAlive(ctx, 8, 19);
        fillAlive(ctx, 5, 20);
        fillAlive(ctx, 6, 20);
        fillAlive(ctx, 7, 20);
        fillAlive(ctx, 8, 20);
        fillAlive(ctx, 14, 12);
        fillAlive(ctx, 15, 11);
        fillAlive(ctx, 15, 10);
        fillAlive(ctx, 16, 11);
        fillAlive(ctx, 17, 11);
        fillAlive(ctx, 18, 11);
        fillAlive(ctx, 19, 11);
        fillAlive(ctx, 20, 11);
        fillAlive(ctx, 21, 11);
        fillAlive(ctx, 22, 11);
        fillAlive(ctx, 23, 11);
        fillAlive(ctx, 24, 11);
        fillAlive(ctx, 25, 11);
        fillAlive(ctx, 6, 21);
        fillAlive(ctx, 7, 21);
        fillAlive(ctx, 8, 21);
        fillAlive(ctx, 15, 12);
        fillAlive(ctx, 16, 12);
        fillAlive(ctx, 17, 12);
        fillAlive(ctx, 18, 12);
        fillAlive(ctx, 19, 12);
        fillAlive(ctx, 20, 12);
        fillAlive(ctx, 21, 12);
        fillAlive(ctx, 22, 12);
        fillAlive(ctx, 23, 12);
        fillAlive(ctx, 24, 12);
        fillAlive(ctx, 16, 10);
        fillAlive(ctx, 17, 10);
        fillAlive(ctx, 18, 10);
        fillAlive(ctx, 19, 10);
        fillAlive(ctx, 20, 10);
        fillAlive(ctx, 21, 10);
        fillAlive(ctx, 22, 10);
        fillAlive(ctx, 23, 10);
        fillAlive(ctx, 24, 10);
        fillAlive(ctx, 25, 10);
        fillAlive(ctx, 5, 25);
        fillAlive(ctx, 5, 26);
        fillAlive(ctx, 6, 27);
        fillAlive(ctx, 6, 26);
        fillAlive(ctx, 7, 26);
        fillAlive(ctx, 8, 26);
        fillAlive(ctx, 9, 26);
        fillAlive(ctx, 10, 26);
        fillAlive(ctx, 11, 26);
        fillAlive(ctx, 12, 26);
        fillAlive(ctx, 13, 26);
        fillAlive(ctx, 14, 26);
        fillAlive(ctx, 15, 27);
        fillAlive(ctx, 14, 25);
        fillAlive(ctx, 6, 25);
        fillAlive(ctx, 7, 25);
        fillAlive(ctx, 8, 25);
        fillAlive(ctx, 9, 25);
        fillAlive(ctx, 10, 25);
        fillAlive(ctx, 11, 25);
        fillAlive(ctx, 12, 25);
        fillAlive(ctx, 13, 25);
        fillAlive(ctx, 7, 27);
        fillAlive(ctx, 8, 27);
        fillAlive(ctx, 9, 27);
        fillAlive(ctx, 10, 27);
        fillAlive(ctx, 11, 27);
        fillAlive(ctx, 12, 27);
        fillAlive(ctx, 13, 27);
        fillAlive(ctx, 14, 27);
        fillAlive(ctx, 22, 25);
        fillAlive(ctx, 23, 25);
        fillAlive(ctx, 24, 25);
        fillAlive(ctx, 25, 25);
        fillAlive(ctx, 22, 24);
        fillAlive(ctx, 23, 24);
        fillAlive(ctx, 24, 24);
        fillAlive(ctx, 22, 23);
        fillAlive(ctx, 23, 23);
        fillAlive(ctx, 24, 23);
        fillAlive(ctx, 25, 23);
        fillAlive(ctx, 22, 22);
        fillAlive(ctx, 24, 22);
        fillAlive(ctx, 23, 22);
        fillAlive(ctx, 22, 21);
        fillAlive(ctx, 23, 21);
        fillAlive(ctx, 24, 21);
        fillAlive(ctx, 25, 21);
        fillAlive(ctx, 22, 20);
        fillAlive(ctx, 23, 20);
        fillAlive(ctx, 24, 20);
        fillAlive(ctx, 22, 19);
        fillAlive(ctx, 23, 19);
        fillAlive(ctx, 24, 19);
        fillAlive(ctx, 25, 19);
        fillAlive(ctx, 22, 18);
        fillAlive(ctx, 23, 18);
        fillAlive(ctx, 24, 18);
        fillAlive(ctx, 22, 17);
        fillAlive(ctx, 23, 17);
        fillAlive(ctx, 24, 17);
        fillAlive(ctx, 25, 17);
        fillAlive(ctx, 22, 16);
        fillAlive(ctx, 23, 16);
        fillAlive(ctx, 24, 16);
        isStart = true;
        clearInterval(initBoard);
        updateBoard = setInterval(update, 500);
    }
}

function gameModeGlider(e) {
    if (canvas[0].getContext) {
        var ctx = canvas[0].getContext('2d');
        fillAlive(ctx,  12, 16);
        fillAlive(ctx,  13, 16);
        fillAlive(ctx,  14, 16);
        fillAlive(ctx,  15, 16);
        fillAlive(ctx,  12, 17);
        fillAlive(ctx,  12, 18);
        fillAlive(ctx,  13, 19);
        isStart = true;
        clearInterval(initBoard);
        updateBoard = setInterval(update, 500);
    }
}

function fillAlive(ctx, x, y) {
    fillHexagon(ctx, vectors[y][x]);
    alive[y][x] = true;
}

// 周囲の生存箇所をランダムに取得
function findAroundPoint(startX, startY) {
    var array = new Array();
    var isEven = startY % 2 == 0;

    // 左上
    var x = startX + (isEven ? 0 : -1);
    var y = startY - 1;
    if (y >= 0) array.push({ x: x, y: y });

    // 右上
    x = startX + (isEven ? 1 : 0);
    y = startY - 1;
    if (x < (isEven ? (bordX - 1) : bordX) && y >= 0)
        array.push({ x: x, y: y });

    // 右
    x = startX + 1;
    y = startY;
    if (x < (isEven ? (bordX - 1) : bordX))
        array.push({ x: x, y: y });

    // 左
    x = startX - 1;
    y = startY;
    if (x >= 0) array.push({ x: x, y: y });

    // 左下
    x = startX + (isEven ? 0 : -1);
    y = startY + 1;
    if (y >= 0 && y < bordY) array.push({ x: x, y: y });

    // 右下
    x = startX + (isEven ? 1 : 0);
    y = startY + 1;
    if (x < (isEven ? (bordX - 1) : bordX) && y < bordY)
        array.push({ x: x, y: y });

    return array;
}

function shakeAroundPoint(aroundPoints) {
    // 並び替え
    for (var i = 0; i < aroundPoints.length; i++) {
        var idx = getRandomInt(aroundPoints.length);
        var tmp1 = aroundPoints[i];
        aroundPoints[i] = aroundPoints[idx];
        aroundPoints[idx] = tmp1;
    }
    return aroundPoints;
}

// 乱数取得
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function update() {
    generation++;

    for (var y = 0; y < bordY; y++) {
        var isEven = y % 2 == 0;
        var size_x = isEven ? (bordX - 1) : bordX;
        for (var x = 0; x < size_x; x++) {
            if (alive[y][x]) {
                var points = findAroundPoint(x, y);
                points.forEach(point => {
                    board[point.y][point.x]++;
                });
            }
        }
    }

    for (var y = 0; y < bordY; y++) {
        var isEven = y % 2 == 0;
        var size_x = isEven ? (bordX - 1) : bordX;
        for (var x = 0; x < size_x; x++) {
            if (board[y][x] != 1) alive[y][x] = (board[y][x] == 2);
            board[y][x] = 0;
        }
    }
    draw();
}

function draw() {
    if (canvas[0].getContext) {
        description.text("Generation:" + (generation > 0 ? generation : ""));
        var ctx = canvas[0].getContext('2d');
        for (var y = 0; y < bordY; y++) {
            var isEven = y % 2 == 0;
            var size_x = isEven ? (bordX - 1) : bordX;
            for (var x = 0; x < size_x; x++) {
                if (alive[y][x]) {
                    fillHexagon(ctx, vectors[y][x]);
                }
                else {
                    strokeHexagon(ctx, vectors[y][x]);
                }
            }
        }
    }
}

$('#reset').on("click", function () {
    console.log("Click");
    if (isStart) {
        isReady = false;
        isStart = false;
        generation = 0;
        clearInterval(updateBoard);
        // 初期化
        for (y = 0; y < bordY; y++) {
            alive[y] = new Array(bordX);
            board[y] = new Array(bordX);
            vectors[y] = new Array(bordX);
            for (x = 0; x < bordX; x++) {
                alive[y][x] = false;
                board[y][x] = 0;
                vectors[y][x] = { x: -1, y: -1, width: -1, height: -1 };
            }
        }
        // 盤面初期化
        initBoard = setInterval(clearBoard, 500);
        description.text(msg);
    }
});