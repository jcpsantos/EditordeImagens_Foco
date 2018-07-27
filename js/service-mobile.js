/**
 * mobile.js
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview
 */
/* eslint-disable vars-on-top */
'use strict';

var MAX_RESOLUTION = 3264 * 2448; // 8MP (Mega Pixel)

var supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
var rImageType = /data:(image\/.+);base64,/;
var shapeOpt = {
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 10
};
var activeObjectId;

// Seletor de controles do editor de imagens
var submenuClass = '.submenu';
var hiddenmenuClass = '.hiddenmenu';

var $controls = $('.tui-image-editor-controls');
var $menuButtons = $controls.find('.menu-button');
var $submenuButtons = $controls.find('.submenu-button');
var $btnShowMenu = $controls.find('.btn-prev');
var $msg = $controls.find('.msg');

var $subMenus = $controls.find(submenuClass);
var $hiddenMenus = $controls.find(hiddenmenuClass);

// Controles do editor de imagem - botões do menu superior
var $inputImage = $('#input-image-file');
var $btnDownload = $('#btn-download');
var $btnUndo = $('#btn-undo');
var $btnRedo = $('#btn-redo');
var $btnRemoveActiveObject = $('#btn-remove-active-object');

// Controles do editor de imagem - botões do menu inferior
var $btnCrop = $('#btn-crop');
var $btnAddText = $('#btn-add-text');

// Controles do editor de imagem - botões do submenu inferior
var $btnApplyCrop = $('#btn-apply-crop');
var $btnFlipX = $('#btn-flip-x');
var $btnFlipY = $('#btn-flip-y');
var $btnRotateClockwise = $('#btn-rotate-clockwise');
var $btnRotateCounterClockWise = $('#btn-rotate-counter-clockwise');
var $btnAddArrowIcon = $('#btn-add-arrow-icon');
var $btnAddCancelIcon = $('#btn-add-cancel-icon');
var $btnAddStarIcon = $('#btn-add-star-icon');
var $btnAddPolygonIcon = $('#btn-add-polygon-icon');
var $btnAddLocationIcon = $('#btn-add-location-icon');
var $btnAddHeartIcon = $('#btn-add-heart-icon');
var $btnAddBubbleIcon = $('#btn-add-bubble-icon')
var $btnAddCustomIcon = $('#btn-add-custom-icon');
var $btnFreeDrawing = $('#btn-free-drawing');
var $btnLineDrawing = $('#btn-line-drawing');
var $btnAddRect = $('#btn-add-rect');
var $btnAddSquare = $('#btn-add-square');
var $btnAddEllipse = $('#btn-add-ellipse');
var $btnAddCircle = $('#btn-add-circle');
var $btnAddTriangle = $('#btn-add-triangle');
var $btnChangeTextStyle = $('.btn-change-text-style');

// Controles do editor de imagem - etc.
var $inputTextSizeRange = $('#input-text-size-range');
var $inputBrushWidthRange = $('#input-brush-range');
var $inputStrokeWidthRange = $('#input-stroke-range');
var $inputCheckTransparent = $('#input-check-transparent');
var $selectFontFamily = document.getElementById("font-family");

// Colorpicker
var iconColorpicker = tui.component.colorpicker.create({
    container: $('#tui-icon-color-picker')[0],
    color: '#000000'
});

var textColorpicker = tui.component.colorpicker.create({
    container: $('#tui-text-color-picker')[0],
    color: '#000000'
});

var brushColorpicker = tui.component.colorpicker.create({
    container: $('#tui-brush-color-picker')[0],
    color: '#000000'
});

var shapeColorpicker = tui.component.colorpicker.create({
    container: $('#tui-shape-color-picker')[0],
    color: '#000000'
});

// Crie um editor de imagens
var imageEditor = new tui.ImageEditor('.tui-image-editor', {
    cssMaxWidth: document.documentElement.clientWidth,
    cssMaxHeight: document.documentElement.clientHeight,
    selectionStyle: {
        cornerSize: 50,
        rotatingPointOffset: 100
    }
});

var $displayingSubMenu, $displayingHiddenMenu;

function hexToRGBa(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var a = alpha || 1;

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

function base64ToBlob(data) {
    var mimeString = '';
    var raw, uInt8Array, i, rawLength;

    raw = data.replace(rImageType, function(header, imageType) {
        mimeString = imageType;

        return '';
    });

    raw = atob(raw);
    rawLength = raw.length;
    uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

    for (i = 0; i < rawLength; i += 1) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: mimeString});
}

function getBrushSettings() {
    var brushWidth = $inputBrushWidthRange.val();
    var brushColor = brushColorpicker.getColor();

    return {
        width: brushWidth,
        color: hexToRGBa(brushColor, 0.5)
    };
}

function activateShapeMode() {
    imageEditor.stopDrawingMode();
}

function activateIconMode() {
    imageEditor.stopDrawingMode();
}

function activateTextMode() {
    if (imageEditor.getDrawingMode() !== 'TEXT') {
        imageEditor.stopDrawingMode();
        imageEditor.startDrawingMode('TEXT');
    }
}

function setTextToolbar(obj) {
    var fontSize = obj.fontSize;
    var fontColor = obj.fill;

    $inputTextSizeRange.val(fontSize);
    textColorpicker.setColor(fontColor);
}

function setIconToolbar(obj) {
    var iconColor = obj.fill;

    iconColorpicker.setColor(iconColor);
}

function setShapeToolbar(obj) {
    var strokeColor, fillColor, isTransparent;
    var colorType = $('[name="select-color-type"]:checked').val();

    if (colorType === 'stroke') {
        strokeColor = obj.stroke;
        isTransparent = (strokeColor === 'transparent');

        if (!isTransparent) {
            shapeColorpicker.setColor(strokeColor);
        }
    } else if (colorType === 'fill') {
        fillColor = obj.fill;
        isTransparent = (fillColor === 'transparent');

        if (!isTransparent) {
            shapeColorpicker.setColor(fillColor);
        }
    }

    $inputCheckTransparent.prop('checked', isTransparent);
    $inputStrokeWidthRange.val(obj.strokeWith);
}

function showSubMenu(type) {
    var index;

    switch (type) {
        case 'shape':
            index = 3;
            break;
        case 'icon':
            index = 4;
            break;
        case 'text':
            index = 5;
            break;
        default:
            index = 0;
    }

    $displayingSubMenu.hide();
    $displayingHiddenMenu.hide();

    $displayingSubMenu = $menuButtons.eq(index).parent().find(submenuClass).show();
}

// Vincular evento customizado do editor de imagens
imageEditor.on({
    undoStackChanged: function(length) {
        if (length) {
            $btnUndo.removeClass('disabled');
        } else {
            $btnUndo.addClass('disabled');
        }
    },
    redoStackChanged: function(length) {
        if (length) {
            $btnRedo.removeClass('disabled');
        } else {
            $btnRedo.addClass('disabled');
        }
    },
    objectScaled: function(obj) {
        if (obj.type === 'text') {
            $inputTextSizeRange.val(obj.fontSize);
        }
    },
    objectActivated: function(obj) {
        activeObjectId = obj.id;
        if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
            showSubMenu('shape');
            setShapeToolbar(obj);
            activateShapeMode();
        } else if (obj.type === 'icon') {
            showSubMenu('icon');
            setIconToolbar(obj);
            activateIconMode();
        } else if (obj.type === 'text') {
            showSubMenu('text');
            setTextToolbar(obj);
            activateTextMode();
        }
    }
});

// O editor de imagem controla a ação
$menuButtons.on('click', function() {
    $displayingSubMenu = $(this).parent().find(submenuClass).show();
    $displayingHiddenMenu = $(this).parent().find(hiddenmenuClass);
});

$submenuButtons.on('click', function() {
    $displayingHiddenMenu.hide();
    $displayingHiddenMenu = $(this).parent().find(hiddenmenuClass).show();
});

$btnShowMenu.on('click', function() {
    $displayingSubMenu.hide();
    $displayingHiddenMenu.hide();
    $msg.show();

    imageEditor.stopDrawingMode();
});

//Ação de carregamento de imagem
$inputImage.on('change', function(event) {
    var file;
    var img;
    var resolution;

    if (!supportingFileAPI) {
        alert('Este navegador não suporta o tipo de arquivo');
    }

    file = event.target.files[0];

    if (file) {
        img = new Image();

        img.onload = function() {
            resolution = this.width * this.height;

            if (resolution <= MAX_RESOLUTION) {
                imageEditor.loadImageFromFile(file).then(() => {
                    imageEditor.clearUndoStack();
                });
            } else {
                alert('Carregado imagen\'s resolução é muito grande!\nA resolução recomendada é 3264 * 2448!');
            }

            URL.revokeObjectURL(file);
        };

        img.src = URL.createObjectURL(file);
    }
});

// Desfazer ação
$btnUndo.on('click', function() {
    if (!$(this).hasClass('disabled')) {
        imageEditor.undo();
    }
});

// Ação refazer
$btnRedo.on('click', function() {
    if (!$(this).hasClass('disabled')) {
        imageEditor.redo();
    }
});

// Remover ação do objeto ativo
$btnRemoveActiveObject.on('click', function() {
    imageEditor.removeObject(activeObjectId);
});

// Ação de download
$btnDownload.on('click', function() {
    var imageName = imageEditor.getImageName();
    var dataURL = imageEditor.toDataURL();
    var blob, type, w;

    if (supportingFileAPI) {
        blob = base64ToBlob(dataURL);
        type = blob.type.split('/')[1];
        if (imageName.split('.').pop() !== type) {
            imageName += '.' + type;
        }

        // Biblioteca: FileSaver - saveAs
        saveAs(blob, imageName); // eslint-disable-line
    } else {
        alert('Este navegador precisa de um servidor de arquivos');
        w = window.open();
        w.document.body.innerHTML = '<img src=' + dataURL + '>';
    }
});

// Ação do menu Cortar
$btnCrop.on('click', function() {
    imageEditor.startDrawingMode('CROPPER');
});

$btnApplyCrop.on('click', function() {
    imageEditor.crop(imageEditor.getCropzoneRect()).then(() => {
        imageEditor.stopDrawingMode();
        $subMenus.removeClass('show');
        $hiddenMenus.removeClass('show');
    });
});

// Ação de menu de orientação
$btnRotateClockwise.on('click', function() {
    imageEditor.rotate(90);
});

$btnRotateCounterClockWise.on('click', function() {
    imageEditor.rotate(-90);
});

$btnFlipX.on('click', function() {
    imageEditor.flipX();
});

$btnFlipY.on('click', function() {
    imageEditor.flipY();
});

// Ação do menu de ícones
$btnAddArrowIcon.on('click', function() {
    imageEditor.addIcon('arrow');
});

$btnAddCancelIcon.on('click', function() {
    imageEditor.addIcon('cancel');
});

$btnAddStarIcon.on('click', function(){
    imageEditor.addIcon('star');
});

$btnAddPolygonIcon.on('click', function(){
    imageEditor.addIcon('polygon');
});

$btnAddLocationIcon.on('click', function(){
    imageEditor.addIcon('location');
});

$btnAddHeartIcon.on('click', function(){
    imageEditor.addIcon('heart');
});

$btnAddBubbleIcon.on('click', function(){
    imageEditor.addIcon('bubble');
});

$btnAddCustomIcon.on('click', function() {
    imageEditor.addIcon('customArrow');
});

iconColorpicker.on('selectColor', function(event) {
    imageEditor.changeIconColor(activeObjectId, event.color);
});

// Ação de menu de texto
$btnAddText.on('click', function() {
    var initText = 'Duplo Click';

    imageEditor.startDrawingMode('TEXT');
    imageEditor.addText(initText, {
        styles: {
            fontSize: parseInt($inputTextSizeRange.val(), 10)
        }
    });
});

$btnChangeTextStyle.on('click', function() {
    var styleType = $(this).attr('data-style-type');
    var styleObj = {};
    var styleObjKey;

    switch (styleType) {
        case 'bold':
            styleObjKey = 'fontWeight';
            break;
        case 'italic':
            styleObjKey = 'fontStyle';
            break;
        case 'underline':
            styleObjKey = 'textDecoration';
            break;
        case 'left':
            styleObjKey = 'textAlign';
            break;
        case 'center':
            styleObjKey = 'textAlign';
            break;
        case 'right':
            styleObjKey = 'textAlign';
            break;
        default:
            styleObjKey = '';
    }

    styleObj[styleObjKey] = styleType;

    imageEditor.changeTextStyle(activeObjectId, styleObj);
});

$inputTextSizeRange.on('change', function() {
    imageEditor.changeTextStyle(activeObjectId, {
        fontSize: parseInt($(this).val(), 10)
    });
});

//Fontes para o texto
var fonts = ['Roboto', 'Hanalei Fill', 'Kirang Haerang', 'Open Sans'];
fonts.forEach(function(font) {
    var option = document.createElement('option');
    option.innerHTML = font;
    option.value = font;
    $selectFontFamily.appendChild(option);
  });

  $selectFontFamily.onchange = function(){
    loadAndUse(this.value)
    console.log(this.value)
    /*imageEditor.changeTextStyle(activeObjectId, {
        fontFamily: toString((this.value))
    })*/
    function loadAndUse(font) {
        var myfont = new FontFaceObserver(font)
        myfont.load()
          .then(function() {
            // quando a fonte é carregada, use-a.
            imageEditor.changeTextStyle(activeObjectId, {
                fontFamily: (font)
            })
          }).catch(function(e) {
            console.log(e)
            alert('Carregamento da fonte '+font+ ' falhou');
          });
      }  
}

  /*$selectFontFamily.onchange = function(){
    if (this.value != null){
        loadAndUse(this.value);
    }else{
        imageEditor.getActiveObject().set("fontFamily", this.value);
        imageEditor.renderAll();
    }
}
function loadAndUse(font) {
    var myfont = new FontFaceObserver(font)
    myfont.load()
      .then(function() {
        // quando a fonte é carregada, use-a.
        imageEditor.getActiveObject().set("fontFamily", font);
        imageEditor.renderAll();
      }).catch(function(e) {
        console.log(e)
        alert('Carregamento da fonte '+font+ ' falhou');
      });
  }  */

textColorpicker.on('selectColor', function(event) {
    imageEditor.changeTextStyle(activeObjectId, {
        fill: event.color
    });
});


// Desenhar ação do menu de linha
$btnFreeDrawing.on('click', function() {
    var settings = getBrushSettings();

    imageEditor.stopDrawingMode();
    imageEditor.startDrawingMode('FREE_DRAWING', settings);
});

$btnLineDrawing.on('click', function() {
    var settings = getBrushSettings();

    imageEditor.stopDrawingMode();
    imageEditor.startDrawingMode('LINE_DRAWING', settings);
});

$inputBrushWidthRange.on('change', function() {
    imageEditor.setBrush({
        width: parseInt($(this).val(), 10)
    });
});

brushColorpicker.on('selectColor', function(event) {
    imageEditor.setBrush({
        color: hexToRGBa(event.color, 0.5)
    });
});

// Adicionar  forma
$btnAddRect.on('click', function() {
    imageEditor.addShape('rect', tui.util.extend({
        width: 500,
        height: 300
    }, shapeOpt));
});

$btnAddSquare.on('click', function() {
    imageEditor.addShape('rect', tui.util.extend({
        width: 400,
        height: 400,
        isRegular: true
    }, shapeOpt));
});

$btnAddEllipse.on('click', function() {
    imageEditor.addShape('circle', tui.util.extend({
        rx: 300,
        ry: 200
    }, shapeOpt));
});

$btnAddCircle.on('click', function() {
    imageEditor.addShape('circle', tui.util.extend({
        rx: 200,
        ry: 200,
        isRegular: true
    }, shapeOpt));
});

$btnAddTriangle.on('click', function() {
    imageEditor.addShape('triangle', tui.util.extend({
        width: 500,
        height: 400,
        isRegular: true
    }, shapeOpt));
});

$inputStrokeWidthRange.on('change', function() {
    imageEditor.changeShape(activeObjectId, {
        strokeWidth: parseInt($(this).val(), 10)
    });
});

$inputCheckTransparent.on('change', function() {
    var colorType = $('[name="select-color-type"]:checked').val();
    var isTransparent = $(this).prop('checked');
    var color;

    if (!isTransparent) {
        color = shapeColorpicker.getColor();
    } else {
        color = 'transparent';
    }

    if (colorType === 'stroke') {
        imageEditor.changeShape(activeObjectId, {
            stroke: color
        });
    } else if (colorType === 'fill') {
        imageEditor.changeShape(activeObjectId, {
            fill: color
        });
    }
});

shapeColorpicker.on('selectColor', function(event) {
    var colorType = $('[name="select-color-type"]:checked').val();
    var isTransparent = $inputCheckTransparent.prop('checked');
    var color = event.color;

    if (isTransparent) {
        return;
    }

    if (colorType === 'stroke') {
        imageEditor.changeShape(activeObjectId, {
            stroke: color
        });
    } else if (colorType === 'fill') {
        imageEditor.changeShape(activeObjectId, {
            fill: color
        });
    }
});

//Carregar imagem de recorte e aplicação de mascara/filtro
var $btnLoadMaskImage = $('#input-mask-image-file');
var $btnApplyMask = $('#btn-apply-mask');
$btnLoadMaskImage.on('change', function() {
    var file;
    var imgUrl;

    if (!supportingFileAPI) {
        alert('Este navegador não suporta este tipo de arquivo');
    }

    file = event.target.files[0];

    if (file) {
        imgUrl = URL.createObjectURL(file);

        imageEditor.loadImageFromURL(imageEditor.toDataURL(), 'FilterImage').then(() => {
            imageEditor.addImageObject(imgUrl).then(objectProps => {
                URL.revokeObjectURL(file);
                console.log(objectProps);
            });
        });
    }
});

$btnApplyMask.on('click', function() {
    imageEditor.applyFilter('mask', {
        maskObjId: activeObjectId
    }).then(result => {
        console.log(result);
    });
});

//Aplicação de filtros na imagem
var $inputCheckGrayscale = $('#input-check-grayscale');
var $inputCheckInvert = $('#input-check-invert');
var $inputCheckSepia = $('#input-check-sepia');
var $inputCheckSepia2 = $('#input-check-sepia2');
var $inputCheckBlur = $('#input-check-blur');
var $inputCheckSharpen = $('#input-check-sharpen');
var $inputCheckEmboss = $('#input-check-emboss');
function applyOrRemoveFilter(applying, type, options) {
    if (applying) {
        imageEditor.applyFilter(type, options).then(result => {
            console.log(result);
        });
    } else {
        imageEditor.removeFilter(type);
    }
}

$inputCheckGrayscale.on('change', function() {
    applyOrRemoveFilter(this.checked, 'Grayscale', null);
});
$inputCheckInvert.on('change', function() {
    applyOrRemoveFilter(this.checked, 'Invert', null);
});

$inputCheckSepia.on('change', function() {
    applyOrRemoveFilter(this.checked, 'Sepia', null);
});

$inputCheckSepia2.on('change', function() {
    applyOrRemoveFilter(this.checked, 'Sepia2', null);
});

$inputCheckBlur.on('change', function() {
    applyOrRemoveFilter(this.checked, 'Blur', null);
});

$inputCheckSharpen.on('change', function() {
    applyOrRemoveFilter(this.checked, 'Sharpen', null);
});

$inputCheckEmboss.on('change', function() {
    applyOrRemoveFilter(this.checked, 'Emboss', null);
});

// Carregar imagem de amostra
imageEditor.loadImageFromURL('https://www.saturdaydownsouth.com/wp-content/uploads/2016/04/IMG-Academy-81sCA5.jpg', 'SampleImage').then(() => {
    imageEditor.clearUndoStack();
});
