"use strict";
/**
 * @typedef {import('../../libarries/quickElement')}
 * @typedef {import('../../libarries/jszip_object')}
 * @typedef {import('../../libarries/multiFetch')}
 * @typedef {import('../../libarries/XML')}
 */

{
    PageDisplay.setTitle('《我的世界》 3D 图腾生成').setIcon('./src/texture/icon.webp').setGraph({ facebook: { title: '《我的世界》3D 图腾生成', type: 'website', description: 'Creating your own totem resource pack with player skin or picture in Minecraft', image: 'https://i.imgur.com/oGv0nbN.jpeg', url: 'https://3dtotem.azqaq.top' }, twitter: { card: 'summary_large_image', title: '《我的世界》3D 图腾生成', description: 'Creating your own totem resource pack with player skin or picture in Minecraft', image: 'https://i.imgur.com/oGv0nbN.jpeg', url: 'https://3dtotem.azqaq.top' } }).importCSS('./src/style/main.css')
}

const skinOptions = {
    isJava: false,
    packname: 'Pack name...'
};
const skinData = {};

new CreateNode(GetElement.id('packName')).setEvent({
    input: (e) => skinOptions.packname = (e.target.value === '') ? 'Pack name...' : e.target.value
})

const skinEditor = Dialog.setup(GetElement.id('skinEditorDialog'),
0.5,
(node, data) => {
    data.onShowDialog = true;
    skinEditor.onCloseCallback = data;
    node.getChild('title', (c) => c.setText(`Light Totem Editor - ${data.name}`));
    node.setAnimate([
        {
            css: {
                opacity: 0,
                transition: '0.5s'
            }
        },
        {
            css: { 
                opacity: 1
            }
        }
    ])
    new CreateNode(GetElement.id('skinEditorDialog')).setAnimate([
        {
            css: {
                top: '60%',
                transition: '0.5s'
            }
        },
        {
            css: {
                top: '50%'
            }
        }
    ]);

    new CreateNode(GetElement.id('editorImage')).setAttribute({
        src: data.data
    })

    const renderer = new CreateNode(GetElement.id('rendererElement')).
        setCSS({
            height: '100%',
            transform: 'translateX(-50%)translateY(-50%)'
        })
    const pxSelect = GetElement.id('imagePixelSelected');
    const hoverPixel = new CreateNode(GetElement.id('pixelHover')).setCSS({
        display: 'none',
        width: `calc(${(1 / data.skinSize) * 100}% - 2px)`,
        height: `calc(${(1 / data.skinSize) * 100}% - 2px)`
    })
    
    let zoom = 100,
        isDragging = false,
        rendererWidth = 0,
        rendererHeight = 0,
        offsetCurrent = {
            x: 0,
            y: 0
        },
        isDraw = false;

    const drawLight = (x, y, width, height, index, requireDraw = false) => {
        if (!data.lightPixel[`${index}`] || requireDraw) {
            data.lightPixel[`${index}`] = 1;
            new CreateNode('div').setCSS({
                pointerEvents: 'none',
                backgroundColor: 'rgba(0, 255, 255, 0.5)',
                position: 'absolute',
                width: `${width}%`,
                height: `${height}%`,
                left: `${x}%`,
                top: `${y}%`
            }).addToNode(pxSelect).setAttribute({ index, name: 'lightPixel' });
        }
    }
    
    for (const index of Object.keys(data.lightPixel).map(v => Number(v))) {
        const [x, y] = [index % data.skinSize, Math.floor(index / data.skinSize)],
            percentSizeX = (x / data.skinSize) * 100,
            percentSizeY = (y / data.skinSize) * 100;
        drawLight(percentSizeX, percentSizeY, (1 / data.skinSize) * 100, (1 / data.skinSize) * 100, index, true);
    };

    new CreateNode(pxSelect).setEvent({
        mousemove: e => {
            if (!data.onShowDialog) return;
            const { width, height } = pxSelect.getBoundingClientRect(),
                [x, y] = [Math.floor((e.offsetX / width) * data.skinSize), Math.floor((e.offsetY / height) * data.skinSize)],
                percentSizeX = (x / data.skinSize) * 100,
                percentSizeY = (y / data.skinSize) * 100;

            hoverPixel.setCSS({
                display: '',
                left: `${percentSizeX}%`,
                top: `${percentSizeY}%`
            });

            if (isDraw) {
                drawLight(percentSizeX, percentSizeY, (1 / data.skinSize) * 100, (1 / data.skinSize) * 100, x + y * data.skinSize);
            }
        },
        mousedown: e => {
            if (!data.onShowDialog) return;
            if (e.button === 0) {
                const { width, height } = pxSelect.getBoundingClientRect(),
                    [x, y] = [Math.floor((e.offsetX / width) * data.skinSize), Math.floor((e.offsetY / height) * data.skinSize)],
                    percentSizeX = (x / data.skinSize) * 100,
                    percentSizeY = (y / data.skinSize) * 100;

                drawLight(percentSizeX, percentSizeY, (1 / data.skinSize) * 100, (1 / data.skinSize) * 100, x + y * data.skinSize);
                isDraw = true
            };
        },
        mouseup: e => {
            if (!data.onShowDialog) return;
            if (e.button === 0) isDraw = false;
        },
        mouseleave: e => {
            if (!data.onShowDialog) return;
            isDraw = false;
        }
    })
    
    let isFirstTick = false;
    const editor = new CreateNode(GetElement.id('editor')).setEvent({
        contextmenu: e => {
            e.preventDefault();
        },
        mousedown: e => {
            if (!data.onShowDialog) return;
            if (e.button === 2) {
                editor.setCSS({
                    cursor: 'grabbing'
                });
                renderer.setCSS({
                    pointerEvents: 'none'
                });
                isDragging = true;
            };
            isFirstTick = true;
        },
        mouseup: e => {
            if (!data.onShowDialog) return;
            if (e.button === 2) {
                editor.setCSS({
                    cursor: 'default'
                });
                renderer.setCSS({
                    pointerEvents: 'auto'
                });
                isDragging = false;
            }
        },
        mousemove: e => {
            if (!data.onShowDialog) return;
            const [deltaX, deltaY] = [ offsetCurrent.x - e.offsetX, offsetCurrent.y - e.offsetY ]
            offsetCurrent = { x: e.offsetX ?? offsetCurrent.x, y: e.offsetY ?? offsetCurrent.y };
            if (isDragging && !isFirstTick) {
                renderer.setCSS({
                    transform: `translateX(calc(-50% + ${rendererWidth -= deltaX}px))translateY(calc(-50% + ${rendererHeight -= deltaY}px))`
                })
            }
            isFirstTick = false;
        },
        mouseleave: () => {
            if (!data.onShowDialog) return;
            editor.setCSS({
                cursor: 'default'
            });
            renderer.setCSS({
                pointerEvents: 'auto'
            });
            isDragging = false;
        },
        wheel: e => {
            if (!data.onShowDialog) return;
            if (e.ctrlKey) {
                e.preventDefault();
                hoverPixel.setCSS({
                    display: 'none'
                });
                renderer.setCSS({
                    height: `${zoom -= (e.deltaY / 10) + ((e.deltaY / 100) * (zoom / 20))}%`
                });
            }
        }
    });

    node.setEvent({
        contextmenu: e => e.preventDefault()
    });
},
(node, data) => {
    node.setAnimate([
        {
            css: {
                opacity: 0
            }
        }
    ])
    new CreateNode(GetElement.id('skinEditorDialog')).setAnimate([
        {
            duration: 500,
            css: {
                top: '60%'
            }
        }
    ], () => {
        skinEditor.hideDialog();
        Array.from(GetElement.name('lightPixel')).forEach(v => v.remove());
    });
    data.onShowDialog = false;
});
skinEditor.autoHideDialogOnClose = false;

Array.from(GetElement.class("dropdown-toggle")).forEach(node => {
    node.onclick = () => {
        ElementClass.toggle(node.parentNode, 'dropdown-active');
    }
})

const updateSkinCounter = () => {
    const skinAmount = Object.keys(skinData).length;
    GetElement.id('skinCounter').innerText = (skinAmount === 1) ? `1张皮肤展开图已被上传！` : `${skinAmount}张皮肤展开图已被上传！`
}

const addSkin = (data, texture, name, isSmallHand, isSize64, skinID = Array.from({length: 15}, () => Math.floor(Math.random() * 15).toString(15)).join('')) => {
    skinData[skinID] = { name: name, data: data, texture: texture, smallHand: isSmallHand, skinSize: isSize64, onShowDialog: false, lightPixel: {} };
    updateSkinCounter();

    const skinElement = new CreateNode('div').insertToNode(GetElement.id('skin-items-container'), 0)
    .setAttribute({ class: 'skin-items', skinID })
    .addHTML(/*html*/`
    <img id="skinPreview" draggable="false" src="${data}">
    <input id="skinName" value="${name}" type="text" class="skinName" placeholder="Your skin name">
    <button class="editTotemLightning squareButton" id="skinEditor" style="display: none;">
        <img src="./src/texture/pen.png">
    </button>
    <div class="skin-option-section">
        <button id="big_hand" class="skinTypeButton skinTypeButtonActive">粗手臂</button>
        <button id="small_hand" class="skinTypeButton">细手臂</button>
        <button id="remove" class="removeTotem squareButton">
            <img class="empty" src="./src/texture/is_empty.ico">
            <img class="bocchi" src="./src/texture/is_has_trash.ico">
        </button>
    </div>
    `).getChild('remove', _ => _.setEvent({
        click: () => {
            delete skinData[skinID]; updateSkinCounter();
            skinElement.setAnimate([
                { duration: 150, css: { opacity: 0, left: -'100%' }},
                { duration: 250, css: { height: '0px', padding: '0px', marginBottom: '0px' } }
            ], n => n.release());
        }
    })).setAnimate([
        { duration: 10, css: { overflow: 'hidden', padding: '0px', transition: '0.3s', height: '0px', opacity: 0 } },
        { duration: 250, css: { height: '90px', padding: '', margin: '' }},
        { duration: 250, css: { opacity: 1 }}
    ]);
    ElementToggle.createRatio([
        GetElement.id('big_hand', skinElement.getNode()),
        GetElement.id('small_hand', skinElement.getNode())
    ], 'skinTypeButtonActive',  0, (e, i) => skinData[skinID].smallHand = (i === 1)).setValue(isSmallHand * 1);

    skinElement.getChild('skinEditor', (node) => {
        node.setEvent({
            click: () => skinEditor.show(skinData[skinID])
        })
    }).getChild('skinName', (node) => {
        node.setEvent({
            input: (e) => skinData[skinID].name = e.currentTarget.value
        })
    })
}

const getPositionArray = (size = [ 1, 1 ], startPos = [ 0, 0 ]) => Array.from({ length: size[1] }, (v, _) => Array.from({ length: size[0] }, (v, i) => [ startPos[0] + i, startPos[1] + _ ])).reduce((p, c) => [...p, ...c]);
const getArrayOfPositon = (pos = [[], []]) => Array.from(pos, (v, k) => getPositionArray(v[0], v[1])).reduce((p, c) => [...p, ...c]);

const pasteImagePixel = (editImageArray, copyImageArray, editImgWidth, imgWidth, position = [ [ 0, 0 ] ], drawPosition = [ [ 0, 0 ] ] ) => {
    position.forEach((pos, index) => {
        const [ r, g, b, a ] = ImageHandle.getPixel(copyImageArray, pos[1] * imgWidth + pos[0]);
        if (a !== 0) {
            let px = drawPosition[index][1] * editImgWidth + drawPosition[index][0];
            editImageArray[px * 4] = r;
            editImageArray[px * 4 + 1] = g;
            editImageArray[px * 4 + 2] = b;
            editImageArray[px * 4 + 3] = a;
        }
    })
    return editImageArray;
}

const onSkinImported = (data, name) => {
    const fTyp = name.match(/\.[^/.]+$/g)[0]?.toLowerCase()
    if (fTyp === '.png') ImageHandle.getImageData(data, (imageData, size) => {
        if ([64, 128].includes(size.width) && [64, 128].includes(size.height)) {
            const isSize64 = size.width === 64;
            let isSmallHand = false;
            for (let i = 0; i < 48 * isSize64; i++) {
                const isSecond = Math.floor(i / (2 * isSize64)) > (12 * isSize64 - 1),
                    [x, y] = [i % (2 * isSize64), Math.floor(i / (2 * isSize64)) - isSecond * (12 * isSize64)];
                if (isSmallHand = isSmallHand || (imageData[(((isSecond ? (20 * isSize64) : (52 * isSize64)) + y) * (64 * isSize64) + (isSecond ? (54 * isSize64) : (46 * isSize64)) + x) * 4 + 3] === 0)) break;
            };
            
            ImageHandle.dataToImage(pasteImagePixel(Array.from({ length: (isSize64 ? 16 : 32) ** 2 * 4 }, () => 0), imageData, 16, 64,
                getArrayOfPositon([
                    [ [ 6, 1 ], [ 9, 8 ] ],
                    [ [ 8, 7 ], [ 8, 9 ] ],
                    [ [ 3, 4 ], [ 20, 50 ] ],
                    [ [ 3, 4 ], [ 5, 18 ] ],
                    [ [ 2, 1 ], [ 20, 63 ] ],
                    [ [ 2, 1 ], [ 6, 31 ] ],
                    [ [ 3, 2 ], [ 40, 20 ] ],
                    [ [ 3, 2 ], [ 39, 52 ] ],
                    [ [ 2, 1 ], [ 40, 31 ] ],
                    [ [ 2, 1 ], [ 40, 62 ] ],

                    [ [ 8, 7 ], [ 40, 10 ] ],
                    [ [ 6, 2 ], [ 41, 9 ] ],
                    [ [ 8, 2 ], [ 20, 21 ] ],
                    [ [ 8, 2 ], [ 20, 39 ] ],
                    [ [ 8, 2 ], [ 20, 29 ] ],
                ]),
                [
                    ...getArrayOfPositon([
                        [ [ 6, 1 ], [ 5, 1 ] ],
                        [ [ 8, 7 ], [ 4, 2 ] ],
                        [ [ 3, 4 ], [ 8, 11 ] ],
                        [ [ 3, 4 ], [ 5, 11 ] ],
                        [ [ 2, 1 ], [ 8, 15 ] ],
                        [ [ 2, 1 ], [ 6, 15 ] ]
                    ]), [ 3, 8 ], [ 3, 9 ], [ 3, 10 ], [ 2, 8 ], [ 2, 9 ], [ 2, 10 ],
                    [ 12, 10 ], [ 12, 9 ], [ 12, 8 ], [ 13, 10 ], [ 13, 9 ], [ 13, 8 ],
                    [ 1, 8 ], [ 1, 9 ], [ 14, 9 ], [ 14, 8 ],

                    ...getArrayOfPositon([
                        [ [ 8, 7 ], [ 4, 3 ] ],
                        [ [ 6, 2 ], [ 5, 1 ] ],
                        [ [ 8, 2 ], [ 4, 9 ] ],
                        [ [ 8, 2 ], [ 4, 9 ] ],  
                        [ [ 8, 2 ], [ 4, 11 ] ],  
                    ])
                ],
            ), { width: 16, height: 16 }, base64 => 
                addSkin(data, base64, name.replace(/\.[^/.]+$/g, ''), isSmallHand, isSize64)
            );
        }
    })
    else if ([ '.mcpack', '.zip' ].includes(fTyp)) {
        Object.keys(skinData).forEach(key => delete skinData[key]);
        fetch(data).then(res => res.blob()).then( v => {
            new JSZip().loadAsync(v).then(async zip => {
                new CreateNode(GetElement.id('skin-items-container')).removeChild();
                const manifest = await zip.file('manifest.json').async('string').then(v => v = JSON.parse(v));
                if (!(manifest.header.version[0] >= 2)) {
                    alert(`You can only import resource packs of version 2.0.0!`);
                    return;
                } 
                skinOptions.packname = manifest.header.name; GetElement.id('packName').value = skinOptions.packname;
                for (const skin of manifest.subpacks) {
                    const { name, folder_name } = skin,
                        skinFolder = zip.folder('subpacks').folder(folder_name),
                        skinData = await skinFolder.file('totem.png').async('blob'),
                        textureData = await skinFolder.folder('textures').folder('items').file('totem.png').async('blob'),
                        _ = new FileReader();
                    _.readAsDataURL(skinData);
                    const img = new Image();
                    img.src = await new Promise(res => _.onload = e => res(e.target.result));
                    const { src: totemData, width: totemSize } = img;
                    await new Promise( res => img.onload = () => res());
                    _.readAsDataURL(textureData);
                    img.src = await new Promise(res => _.onload = e => res(e.target.result));
                    await new Promise( res => img.onload = () => res());
                    addSkin(totemData, img.src.split(',')[1], name, skinFolder.folder('attachables').file('totem.json') !== null, totemSize === 64, folder_name);
                };
                updateSkinCounter();
            })
        })
    } 
}

ImportFile.setup(document.body, onSkinImported, undefined, false, false, 80,
() => new CreateNode(GetElement.id('drop-file-here')).setCSS({display: ''}),
() => new CreateNode(GetElement.id('drop-file-here')).setCSS({display: 'none'}))

ImportFile.setup(GetElement.id('importImage'), onSkinImported, undefined, false, true, 80);

new CreateNode(GetElement.id('download')).setEvent({
    click: () => {
        if (Object.keys(skinData).length === 0) alert('Please import at least 1 skin to download');
        else {
            const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            multiFetch({
                bedrockSrc: {
                    packs: {
                        'manifest.json': async (v) => {
                            const data = await v.json();
                            for (const dataKey of Object.keys(skinData)) {
                                data.subpacks.push(
                                    {
                                        folder_name: dataKey,
                                        name: skinData[dataKey].name,
                                        memory_tier: 1
                                    }
                                )
                            }
                            data.header.name = skinOptions.packname;
                            data.header.uuid = "$$$$$$$$-$$$$-$$$$-$$$$-$$$$$$$$$$$$".replaceAll(/\$/g, () => Math.floor(Math.random() * 16).toString(16));
                            return JSON.stringify(data);
                        },
                        animations: {
                            'totem_firstperson.json': async (v) => {
                                return JSON.stringify((await v.json()))
                            },
                            'totem.json': async (v) => {
                                return JSON.stringify((await v.json()))
                            }
                        },
                        attachables: {
                            'totem.json': async (v) => {
                                return JSON.stringify((await v.json()))
                            }
                        },
                        render_controllers: {
                            'totem.render_controllers.json': async (v) => {
                                return JSON.stringify((await v.json()))
                            }
                        }
                    },
                    model: {
                        'totem_left_slim.geo.json': async (v) => {
                            return JSON.stringify((await v.json()))
                        },
                        'totem_left_small.geo.json': async (v) => {
                            return JSON.stringify((await v.json()))
                        },
                        'totem_right_slim.geo.json': async (v) => {
                            return JSON.stringify((await v.json()))
                        },
                        'totem_right_small.geo.json': async (v) => {
                            return JSON.stringify((await v.json()))
                        }
                    }
                }
            }).then(v => {
                const subpacks = {};
                Object.keys(skinData).forEach(e => {
                    const data = skinData[e];
                    subpacks[e] = {
                        'totem.png': [ data.data.split(',')[1] ],
                        'texts': {
                            'en_US.lang': `item.totem.name=${data.name}`
                        },
                        textures: {
                            items: {
                                'totem.png': [ data.texture ]
                            }
                        }
                    };
                    if (data.smallHand) {
                        const totem = JSON.parse(v.bedrockSrc.packs.attachables['totem.json']);
                        totem['minecraft:attachable'].description.geometry = {
                            totem_left: 'geometry.asa_small_totem_left',
                            totem_right: 'geometry.asa_small_totem_right'
                        }
                        subpacks[e]['attachables'] = {
                            'totem.json': JSON.stringify(totem)
                        }
                    }
                });
                new ObjectToZip({
                    ...v.bedrockSrc.packs,
                    models: {
                        entity: {
                            ...v.bedrockSrc.model
                        }
                    },
                    'pack_icon.png': [ skinData[Object.keys(skinData)[0]].texture ],
                    subpacks
                }).download(`${skinOptions.packname}.mcpack`);
            })
        }
    }
})