let blockSprite = function (params) {
    /*
        функция для создания спрайта блока и работы с ним
        params = {
            width,          //Ширина спрайта в пикселях
            height,         //Высота спрайта в пикселях
            speed,          //Скорость движения спрайта
            minMoveX,       //текущее мин. значение координаты по оси х
            maxMoveX,       //текущее макс. значение координаты по оси х
            maxMoveY,       //текущее макс. значение координаты по оси у
            firstBlock,     //маркировка первого блока фигуры (true/false)
            ctx,            //полотно для рисования спрайта
        }
    */

    let width = params.width - 2,
        height = params.height - 2,
        speed = params.speed,
        firstBlock = params.firstBlock,
        ctx = params.ctx,
        currentX, currentY;

    let that = {
        clear: function () {
            //стираем блок
            ctx.clearRect(currentX, currentY, width, height);
        },
        draw: function (x, y, color = "rgb(45, 50, 255)") {
            ctx.fillStyle = color;

            currentX = x;
            currentY = y;

            //рисуем блок
            ctx.fillRect(currentX, currentY, width, height);
        },
        getBlockCoords: function () {
            //функция для получения текущих координат блока
            return [currentX, currentY];
        },
        getTopLeftCoords: function () {
            //функция для получения координат левого верхнего угла фигуры
            return params['topLeftCoords'];
        },
        getSpeed: function () {
            //функция для получения текущей скорости блока
            return speed;
        },
        isFirstBlock: function () {
            //проверка, является ли данный блок первым блоком
            return firstBlock;
        },
        move: function (direction, speedUp = false) {
            that.clear(currentX, currentY);

            let minX = params.minMoveX,
                maxX = params.maxMoveX,
                maxY = params.maxMoveY;

            let topLeftX = params['topLeftCoords'][0],
                topLeftY = params['topLeftCoords'][1];

            //движение блока (блок сам все время падает, можно двигать кнопками только по горизонтали)
            switch (direction) {
                case 'left':
                    currentX -= speed;
                    if (currentX < minX) {
                        currentX = minX;
                    }
                    if (firstBlock && (topLeftX - speed) >= minX) {
                        //сдвигаем координату х левого верхнего угла фигуры
                        topLeftX -= speed;
                    }
                    break;
                case 'right':
                    currentX += speed;

                    if (currentX > maxX - width - 2) {
                        currentX = maxX - width - 2;
                    }
                    if (firstBlock && (topLeftX + params['shapeWidth'] * (width + 2)) < params['maxX']) {
                        //сдвигаем координату х левого верхнего угла фигуры
                        topLeftX += speed;
                    }
                    break;
                default:
                    // let steps = (speedUp) ? 2 : 1;      //на сколько шагов сдвигаем блок

                    // currentY += speed * steps;

                    // if (currentY > maxY - (height + 2) * steps) {
                    //     // currentY = maxY - params['shapeHeight'] * (height + 2) * steps;
                    //     speed = 0;
                    // }

                    // if (firstBlock) {
                    // // if (firstBlock && (topLeftY + params['shapeHeight'] * (height + 2) * steps <= maxY)) {
                    //     //сдвигаем координату у левого верхнего угла фигуры
                    //     topLeftY += speed * steps;
                    // }

                    if (speedUp) {
                        let newSpeed = speed * 2;
                        currentY += newSpeed;

                        if (currentY === maxY) {
                            newSpeed = speed;
                            currentY -= speed;
                        }

                        if (currentY > maxY - (height + 2)) {
                            newSpeed = speed = 0;
                        }

                        if (firstBlock) {
                            //сдвигаем координату у левого верхнего угла фигуры
                            topLeftY += newSpeed;
                        }
                    } else {
                        currentY += speed;

                        if (currentY > maxY - (height + 2)) {
                            speed = 0;
                        }

                        if (firstBlock) {
                            //сдвигаем координату у левого верхнего угла фигуры
                            topLeftY += speed;
                        }
                    }

                // if (firstBlock) {
                //     console.log('---------------------');
                // }

                // console.log('speedUp', speedUp);
                // console.log('currentY', currentY);
                // console.log('maxY', maxY);
                // console.log('topLeftY', topLeftY);
            }

            params['topLeftCoords'] = [topLeftX, topLeftY];
        },
    };

    return that;
};

let figureSprite = function (params) {
    /*
        функция для управления количеством блоков и их расположением в фигуре
        params = {
            width,          //Ширина блока в пикселях
            height,         //Высота блока в пикселях
            speed,          //Скорость движения блока
            minX,           //мин. значение координаты по оси х
            maxX,           //макс. значение координаты по оси х
            maxY,           //макс. значение координаты по оси у
            setNum,         //номер набора фигур
            shapeNum,       //номер формы фигуры
            ctx,            //полотно для рисования блока
        }
    */

    let numBlocks = 4,                                      //Количество объектов blockSprite, которые необходимо инициализировать
        topLeftX, topLeftY,                                 //координаты левого верхнего угла фигуры
        figureSpeed = params.speed,                         //скорость движения фигуры
        setNum = params.setNum,                             //номер набора фигур
        shapeNum = params.shapeNum,                         //номер формы фигуры
        fallenBlocksCoords = params.fallenBlocksCoords,     //массив координат всех уже упавших на поле блоков
        figureBlocks = [],                                  //блоки, из которых состоит данная фигура
        savedBlocksCoords = [],                             //координаты блоков фигуры до ее сдвигания
        speedUp = false,                                    //нужно ли ускорить падение блока (по нажатию стрелки вниз)
        gameOver = false;                                   //конец игры

    let that = {
        draw: function (x, y) {
            figureBlocks = [];

            topLeftX = x;
            topLeftY = y;

            //варианты фигур (нумерацию фигур и блоков в них можно посмотреть в файле tetris/images/figures.png)
            let figureShapes = {
                'shapeSet1': {
                    'shape1': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 2,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 3,
                        }],
                        'maxX': params.maxX,
                        'maxY': params.maxY - params.height * 3,
                        'shapeWidth': 1,
                        'shapeHeight': 4,
                    },
                    'shape2': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 3,
                            'y': topLeftY + params.height * 0,
                        }],
                        'maxX': params.maxX - params.width * 3,
                        'maxY': params.maxY,
                        'shapeWidth': 4,
                        'shapeHeight': 1,
                    },
                },
                'shapeSet2': {
                    'shape1': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                    'shape2': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                    'shape3': {
                        'coords': [{
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 2,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                    'shape4': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                },
                'shapeSet3': {
                    'shape1': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                    'shape2': {
                        'coords': [{
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                    'shape3': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 2,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                    'shape4': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 0,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                },
                'shapeSet4': {
                    'shape1': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                    'shape2': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                    'shape3': {
                        'coords': [{
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                    'shape4': {
                        'coords': [{
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                },
                'shapeSet5': {
                    'shape1': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 2,
                        'shapeHeight': 2,
                    },
                },
                'shapeSet6': {
                    'shape1': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,

                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                    'shape2': {
                        'coords': [{
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                },
                'shapeSet7': {
                    'shape1': {
                        'coords': [{
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 2,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }],
                        'maxX': params.maxX - params.width * 2,
                        'maxY': params.maxY - params.height * 1,
                        'shapeWidth': 3,
                        'shapeHeight': 2,
                    },
                    'shape2': {
                        'coords': [{
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 0,
                        }, {
                            'x': topLeftX + params.width * 0,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 1,
                        }, {
                            'x': topLeftX + params.width * 1,
                            'y': topLeftY + params.height * 2,
                        }],
                        'maxX': params.maxX - params.width * 1,
                        'maxY': params.maxY - params.height * 2,
                        'shapeWidth': 2,
                        'shapeHeight': 3,
                    },
                },
            };

            //случайным образом выбираем отображаемую фигуру и ее ориентацию в пространстве
            if (setNum === null) {
                setNum = Math.trunc(Math.random() * 7) + 1;
            }
            if (shapeNum === null) {
                switch (setNum) {
                    case 1:
                    case 6:
                    case 7:
                        shapeNum = Math.trunc(Math.random() * 2) + 1;
                        break;
                    case 5:
                        shapeNum = Math.trunc(Math.random() * 1) + 1;
                        break;
                    default:
                        shapeNum = Math.trunc(Math.random() * 4) + 1;
                }
            }
            let shape = figureShapes[`shapeSet${setNum}`][`shape${shapeNum}`];

            let minFallenX = null;
            let maxFallenX = null;
            let maxFallenY = null;
            for (let i = 0; i < numBlocks; i++) {
                let blockX = shape['coords'][i]['x'],
                    blockY = shape['coords'][i]['y'],
                    shapeWidth = shape['shapeWidth'],
                    shapeHeight = shape['shapeHeight'];

                if (fallenBlocksCoords[shapeHeight - 1] && fallenBlocksCoords[shapeHeight - 1].includes(blockX)) {
                    gameOver = true;
                }

                //добавляем в параметры доп. информацию
                params['topLeftCoords'] = [topLeftX, topLeftY];
                params['shapeWidth'] = shapeWidth;
                params['shapeHeight'] = shapeHeight;

                if (i == 0) {
                    params['firstBlock'] = true;
                } else {
                    params['firstBlock'] = false;
                }

                // меняем нижнюю границу по у в зависимости от наличия уже упавших блоков
                if (fallenBlocksCoords[(blockY / params.height) + 1]) {
                    let fallenXVals = fallenBlocksCoords[(blockY / params.height) + 1];
                    if (fallenXVals.includes(blockX)) {
                        maxFallenY = blockY + params.height;
                    }
                }

                // меняем границы по х в зависимости от наличия уже упавших блоков
                if (fallenBlocksCoords[(blockY / params.height)]) {
                    let fallenXVals = fallenBlocksCoords[(blockY / params.height)];
                    if (fallenXVals.includes(blockX - params.width)) {
                        if (minFallenX === null || blockX > minFallenX) {
                            minFallenX = blockX;
                        }
                    }
                    if (fallenXVals.includes(blockX + params.width)) {
                        if (maxFallenX === null || (blockX + params.width) < maxFallenX) {
                            maxFallenX = blockX + params.width;
                        }
                    }
                }

                params['minMoveX'] = (minFallenX === null) ? params.minX : minFallenX;
                params['maxMoveX'] = (maxFallenX === null) ? shape['maxX'] : shape['maxX'] - params.maxX + maxFallenX;
                params['maxMoveY'] = (maxFallenY === null) ? shape['maxY'] : shape['maxY'] - params.maxY + maxFallenY;

                if (params['maxMoveY'] < 0) {
                    params['maxMoveY'] = 0;
                }

                let block = blockSprite(params);
                block.draw(blockX, blockY);

                figureBlocks.push(block);
            }

            return gameOver;
        },
        getSavedBlocks: function () {
            return savedBlocksCoords;
        },
        move: function (direction) {
            for (let i = 0; i < numBlocks; i++) {
                let block = figureBlocks[i];

                savedBlocksCoords.push(block.getBlockCoords());
                block.move(direction, speedUp);

                if (block.isFirstBlock()) {
                    [topLeftX, topLeftY] = block.getTopLeftCoords();
                    figureSpeed = block.getSpeed();
                }
            }

            if (figureSpeed !== 0) {
                savedBlocksCoords = [];
            }

            speedUp = false;        //убираем ускорение (если оно было)

            return [topLeftX, topLeftY, figureSpeed];
        },
        rotate: function () {
            //кол-во возможных поворотов фигуры
            let shapeRotations = {
                'shapeSet1': 2,
                'shapeSet2': 4,
                'shapeSet3': 4,
                'shapeSet4': 4,
                'shapeSet5': 1,
                'shapeSet6': 2,
                'shapeSet7': 2,
            };

            let maxRotation = shapeRotations[`shapeSet${setNum}`];

            shapeNum += 1;
            shapeNum = (shapeNum > maxRotation) ? 1 : shapeNum;
        },
        speedUp: function () {
            speedUp = true;
        }
    }

    return that;
};

let endTetrisGameSprite = function (params) {
    /*
        функция для создания спрайта текста окончания игры и работы с ним
        params = {
            width,          //Ширина спрайта в пикселях
            height,         //Высота спрайта в пикселях
            x,              //значение координаты по оси х
            y,              //значение координаты по оси у
            ctx,            //полотно для рисования спрайта
        }
    */

    let width = params.width,
        height = params.height,
        x = params.x,
        y = params.y,
        ctx = params.ctx;

    let loseImg = new Image();
    loseImg.src = 'images/lose.png';

    let winImg = new Image();
    winImg.src = 'images/win.png';

    let that = {
        draw: function (gameResult) {
            //отображаем сообщение победы / поражения

            if (gameResult === 'win') {
                ctx.drawImage(winImg, x, y, width, height);
            } else if (gameResult === 'lose') {
                ctx.drawImage(loseImg, x, y, width, height);
            }
        }
    }

    return that;

};

function updateTetrisScore(clearScore = false) {
    /*
        функция для обновления значения счетчика
        clearScore - аргумент, указывающий, нужно ли обнулять счетчик очков (true/false, по умолчанию false)
    */

    let scoreLabel = document.getElementById('tetris-score-label');
    let labelContent = scoreLabel.textContent.split(': ');

    let newScore = 0;
    if (!clearScore) {
        newScore = parseInt(labelContent[1]) + 10;
    }

    //меняем счет
    scoreLabel.textContent = labelContent[0] + ': ' + newScore;

    return newScore;
}

function pauseTetrisGame() {
    //обработка нажатия на кнопку "Пауза" (остановить/запустить игру)
    let pauseButton = document.getElementById('tetris-pause-button');

    if (pauseButton.getAttribute('pauseGame') === 'true') {
        pauseButton.setAttribute('pauseGame', false);
    } else {
        pauseButton.setAttribute('pauseGame', true);
    }
}

function startTetrisGame() {
    let levelParams = {
        'easy': {
            // 'maxScore': 500,
            'gameSpeed': 800,
        },
        'medium': {
            // 'maxScore': 1000,
            'gameSpeed': 600,
        },
        'hard': {
            // 'maxScore': 1500,
            'gameSpeed': 400,
        },
    };

    let startButton = document.getElementById('tetris-start-button');
    let pauseButton = document.getElementById('tetris-pause-button');

    if (!startButton.disabled) {
        //сбрасываем счетчик очков, если игра перезапускается
        let score = updateTetrisScore(true);

        //отключаем повторное нажатие на кнопку "Start"
        startButton.disabled = true;
        startButton.classList.add('disabled-button');

        //активируем кнопку "Pause"
        pauseButton.disabled = false;
        pauseButton.classList.remove('disabled-button');
        pauseButton.focus();

        //определяем, какой уровень сложности выбран
        let selectedLevel = '';
        let levelElements = document.getElementsByName('tetrisLevel');
        for (let el of levelElements) {
            if (el.checked) {
                selectedLevel = el.value;
            }
        }

        let gameField = document.getElementById('tetris-game-field'),                       // игровое поле
            ctx = gameField.getContext('2d'),
            fieldWidth = gameField.width,
            fieldHeight = gameField.height,

            // maxScore = levelParams[selectedLevel]['maxScore'],                              //кол-во очков до победы
            gameSpeed = levelParams[selectedLevel]['gameSpeed'],                            //скорость обновления экрана

            blockSize = 50,
            blockSpeed = 50,                                                                // Исходная скорость блока
            xPosBlock = Math.floor(fieldWidth / blockSize / 2) * blockSize - blockSize,     // Исходная позиция блока по оси х
            yPosBlock = 0,                                                                  // Исходная позиция блока по оси y
            direction = 'down',                                                             // Исходное направление движения
            fallenBlocksCoords = [],                                                        // Массив координат всех уже упавших блоков

            initParams = {
                'width': blockSize,
                'height': blockSize,
                'speed': blockSpeed,
                'minX': 0,
                'maxX': fieldWidth,
                'maxY': fieldHeight,
                'minMoveX': 0,
                'maxMoveX': fieldWidth,
                'maxMoveY': fieldHeight,
                'setNum': null,
                'shapeNum': null,
                'fallenBlocksCoords': fallenBlocksCoords,
                'ctx': ctx,
            },

            blockFigure = figureSprite(initParams),

            endGame = endTetrisGameSprite({
                'width': Math.floor(fieldWidth * 3 / 5),
                'height': Math.floor(fieldHeight * 1 / 5),
                'x': Math.floor(fieldWidth / 5),
                'y': Math.floor(fieldHeight / 3),
                'ctx': ctx,
            });

        //привязываем обработку нажатия кнопок
        document.onkeydown = function (e) {
            switch (e.key) {
                case 'ArrowLeft':
                    direction = 'left';
                    break;
                case 'ArrowRight':
                    direction = 'right';
                    break;
                case 'ArrowUp':
                    blockFigure.rotate();
                    break;
                case 'ArrowDown':
                    blockFigure.speedUp();
                    break;
                default:
                    direction = 'down';
            }
        };

        //перед началом игры очищаем игровое поле
        ctx.clearRect(0, 0, fieldWidth, fieldHeight);

        //рисуем фигуру
        blockFigure.draw(xPosBlock, yPosBlock);

        function gameFlow() {
            //основная функция игрового потока

            if (pauseButton.getAttribute('pauseGame') !== 'true') {     //кнопка "Пауза" не нажималась
                let [newX, newY, speed] = blockFigure.move(direction);

                if (speed === 0) {      //если фигура достигла дна
                    //добавляем ее координаты в массив уже упавших блоков
                    let figureCoords = blockFigure.getSavedBlocks();
                    let deleteRow = [];
                    for (let coords of figureCoords) {
                        let x = coords[0],
                            y = coords[1] / blockSize;

                        if (!fallenBlocksCoords[y]) {
                            fallenBlocksCoords[y] = [];
                        }

                        if (!fallenBlocksCoords[y].includes(x)) {
                            fallenBlocksCoords[y].push(x);
                        }

                        //определяем, есть ли полностью заполненные ряды
                        if (fallenBlocksCoords[y].length === fieldWidth / blockSize) {
                            deleteRow.push(y);
                        }
                    }

                    //удаляем полностью заполненные ряды
                    if (deleteRow.length !== 0) {
                        for (let ind of deleteRow) {
                            // let removedBlock = blockSprite(initParams);

                            // for (let k of fallenBlocksCoords[ind]) {
                            //     removedBlock.draw(k, ind * blockSize, color = "rgb(0, 160, 255)");
                            // }

                            // setTimeout(() => {
                            //     for (let k of fallenBlocksCoords[ind]) {
                            //         removedBlock.draw(k, ind * blockSize, color = "rgb(45, 50, 255)");
                            //     }
                            // }, gameSpeed / 10);

                            delete fallenBlocksCoords[ind];

                            updateTetrisScore();
                        }

                        //добавляем бонусные очки за 3 и 4 ряда, убранных одновременно
                        let bonusScores = 0;
                        if (deleteRow.length === 3) {
                            bonusScores = 2;
                        } else if (deleteRow.length === 4) {
                            bonusScores = 6;
                        }

                        for (let i = 1; i <= bonusScores; i++) {
                            updateTetrisScore();
                        }

                        deleteRow.sort((x, y) => x > y);       //сортируем по возрастанию

                        //сдвигаем вниз ряды, которые выше удаленного ряда / рядов
                        for (let ind of deleteRow) {
                            for (let k = ind - 1; k >= 0; k--) {
                                fallenBlocksCoords[k + 1] = (fallenBlocksCoords[k] !== undefined) ? fallenBlocksCoords[k] : [];
                                if (k === 0) {
                                    delete fallenBlocksCoords[k];
                                }
                            }
                        }

                        //очищаем игровое поле
                        ctx.clearRect(0, 0, fieldWidth, fieldHeight);
                    }

                    //рисуем все упавшие блоки
                    let fallenBlock = blockSprite(initParams);
                    for (let i = 0; i < fallenBlocksCoords.length; i++) {       //y-coords
                        if (fallenBlocksCoords[i]) {
                            for (let j of fallenBlocksCoords[i]) {          //x-coords
                                fallenBlock.draw(j, i * blockSize);
                            }
                        }
                    }

                    //рисуем новую фигуру
                    blockFigure = figureSprite(initParams);
                    let gameOver = blockFigure.draw(xPosBlock, yPosBlock);

                    if (gameOver) {
                        clearInterval(blockTimer);

                        //очищаем игровое поле
                        ctx.clearRect(0, 0, fieldWidth, fieldHeight);

                        endGame.draw('lose');

                        //разрешаем снова запустить игру
                        startButton.disabled = false;
                        startButton.classList.remove('disabled-button');
                        startButton.focus();

                        //деактивируем кнопку "Pause"
                        pauseButton.disabled = true;
                        pauseButton.classList.add('disabled-button');
                        pauseButton.setAttribute('pauseGame', false);
                    }

                } else {
                    //рисуем фигуру в новых координатах
                    blockFigure.draw(newX, newY);
                    direction = 'down';
                }
            } else {
                //останавливаем игру
                clearInterval(blockTimer);

                //ожидаем повторного нажатия на кнопку "Пауза" для продолжения игры
                let pauseTimer = setInterval(function () {
                    if (pauseButton.getAttribute('pauseGame') !== 'true') {
                        clearInterval(pauseTimer);

                        blockTimer = setInterval(gameFlow, gameSpeed);
                    }
                }, gameSpeed);
            }
        }

        let blockTimer = setInterval(gameFlow, gameSpeed);
    }
}
