kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1]
})
const JUMP_FORCE = 360
let CURRENT_JUMP_FORCE = JUMP_FORCE
let BIG_JUMP_FORCE = 550
const MOVE_SPEED = 120
const ENEMY_SPEED = 80
let segundoPulo = true;
const FALL_DEATH = 400;
loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')

loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')


scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [[
        '                                        ',
        '                                        ',
        '                                        ',
        '                                        ',
        '                                        ',
        '                                        ',
        '                                        ',
        '   *   =*=%=                            ',
        '                                        ',
        '                          -+            ',
        '                   ^   ^  ()            ',
        '============================   ========='
    ], [
        '£                                    z   £',
        '£                                   xx   £',
        '£                                  xxx   £',
        '£                                 xxxx   £',
        '£                                xxzxx   £',
        '£                               xxxxxx   £',
        '£                              xxxxxxx   £',
        '£   x   !z!@!@@@@             xxxxxxxx   £',
        '£                            xxxxxxxxx   £',
        '£                           xxxxxxxxxx -+£',
        '£                   z   z  xxxxxxxxxxx ()£',
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!£'
    ], [
        '£                      z z z z z z z z z £',
        '£                                  xxx   £',
        '£                                 xxxx   £',
        '£                                xxzxx   £',
        '£                               xxxxxx   £',
        '£                              xxxxxxx   £',
        '£   x   !z!@!@@@@             xxxxxxxx   £',
        '£                            xxxxxxxxx   £',
        '£                           xxxxxxxxxx -+£',
        '£                   z   z  xxxxxxxxxxx ()£',
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!£'
    ]]
    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '$': [sprite('coin'), solid(), 'coin', body()],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5), ['pipe']],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5), ['pipe']],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), ['pipe']],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), ['pipe']],
        '^': [sprite('evil-shroom'), solid(), 'dangerous'],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],//O body indica que faz parte da estrutura do jogo 
        '£': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous', body()],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite('blue-steel'), solid(), scale(0.5)],

    }
    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLabel = add([
        text(score),
        pos(30, 6),
        layer('ui'),
        {
            value: score
        }
    ])

    add([text('Level :' + parseInt(level + 1)), pos(40, 6)])

    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {
                    timer -= dt()
                    // CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    if (timer <= 0)
                        this.smallify()
                }
            }, isBig() {
                return isBig;
            }, smallify() {
                this.scale = vec2(1)
                timer = 0
                CURRENT_JUMP_FORCE = JUMP_FORCE
                isBig = false;
            },
            biggify(time) {
                this.scale = vec2(2)
                timer = time
                isBig = true
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
            }
        }
    }

    //Declarando mario 
    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ])

    //Quando ele bater a cabeça em algo 
    player.on("headbump", (obj) => {
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
        else if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })


    player.collides('mushroom', (m) => {//Quando ele encosta 
        destroy(m)
        player.biggify(6)
    })

    player.collides('coin', (c) => {//Quando ele encosta 
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value;
    })
    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d);
        }
        else if (player.isBig()) {
            player.smallify();
            destroy(d);
        }
        else {
            go('lose', { score: scoreLabel.value })
        }
    })

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    })
    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    player.action(() => {
        if (player.grounded()) {
            isJumping = false;
        }
    })
    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH)
            go('lose', { score: scoreLabel.value })
    })
    player.collides('pipe', () => {
        keyPress('down', () => {
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            })
        })

    })
    keyPress('space', () => {
        if (player.grounded())//Está no chão ou for segundo pulo 
        {
            isJumping = true;
            player.jump(CURRENT_JUMP_FORCE)
            segundoPulo = false;
        }
        else if (!player.grounded() && !segundoPulo) {
            player.jump(CURRENT_JUMP_FORCE)
            segundoPulo = true;
            isJumping = true;
        }
    })
    action('mushroom', (m) => {
        m.move(MOVE_SPEED / 2, 0)
    })
    action('dangerous', (m) => {
        m.move(-ENEMY_SPEED, 0)//O segundo parametro indica o angulo de inclinação do movimento
    })


})
scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
})
start("game", { level: 0, score: 0 })//Começa com zero