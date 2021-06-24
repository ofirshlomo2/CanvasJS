class canvasHelper {
    canvas;
    ctx;
    flag = false;
    prevX = 0;
    currX = 0;
    prevY = 0;
    currY = 0;
    dot_flag = false;


    findxy(res, e) {
        if (res == 'down') {
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.currX = e.clientX - this.canvas.offsetLeft;
            this.currY = e.clientY - this.canvas.offsetTop;

            this.flag = true;
            this.dot_flag = true;
            if (this.dot_flag) {
                this.ctx.beginPath();
                this.ctx.fillStyle = pageSettings.brushColor;
                this.ctx.fillRect(this.currX, this.currY, 2, 2);
                this.ctx.closePath();
                this.dot_flag = false;
            }
        }
        if (res == 'up' || res == "out") {
            this.flag = false;
        }
        if (res == 'move') {
            if (this.flag) {
                this.prevX = this.currX;
                this.prevY = this.currY;
                this.currX = e.clientX - this.canvas.offsetLeft;
                this.currY = e.clientY - this.canvas.offsetTop;
                this.draw();
            }
            $('#mousePos').html(`Pos: ${e.clientX},${e.clientY}`);
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.prevX, this.prevY);
        this.ctx.lineTo(this.currX, this.currY);
        this.ctx.strokeStyle = pageSettings.brushColor;
        this.ctx.lineWidth = pageSettings.brushSize;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("mousemove", (e) => {
            this.findxy('move', e)
        }, false);
        this.canvas.addEventListener("mousedown", (e) => {
            this.findxy('down', e)
        }, false);
        this.canvas.addEventListener("mouseup", (e) => {
            this.findxy('up', e)
        }, false);
        this.canvas.addEventListener("mouseout", (e) => {
            this.findxy('out', e)
        }, false);
    }

    drewImage(img) {
        this.ctx.drawImage(img, 0, 0);
    }
    getImage() {
       return this.canvas.toDataURL("image/png");
    }
}

let pageSettings = {
    brushSize: 0,
    brushColor: '',
    bgColor: ''
}

const canvasHelperObject = new canvasHelper('paintCanvas');
$(() => {

    loadImagesFromServer();
    $('#clearBtn').click(function () {
        var m = confirm("Want to clear");
        if (m) {
            canvasHelperObject.clear();
        }
    })
    $('#brushSize').change(function () {
        pageSettings.brushSize = parseFloat($(this).val());

        $('#brushSizeVal').html('Brush Size ' + pageSettings.brushSize)
    });
    $('#brushColor').change(function () {
        pageSettings.brushColor = $(this).val();
        $('#brushColorVal').html('Brush Color ' + pageSettings.brushColor)
    })
    $('#bgColor').change(function () {
        pageSettings.bgColor = parseFloat($(this).val());
    });
    $('#fileLoadBtn').change(async function () {
        const file = document.querySelector('#fileLoadBtn').files[0];
        const base64Str = await toBase64(file);
        var img = new Image;
        img.onload = function () {
            canvasHelperObject.drewImage(this);
        };
        img.src = base64Str;

    })

    $('#saveImg').click(async () => {

        const dataURL = canvasHelperObject.getImage();
        sendAjaxReq('POST', {data: dataURL}, 'images', (res) => {
            initImages(res);
        }, () => {
            alert('image saved error');
        });
    });

    $('#clearAllImgs').click(() => {
        deleteImages();
    })

    $('body').on('click', '.image-item', function () {
        const src = $(this).attr('src');
        var img = new Image;
        img.onload = function () {
            canvasHelperObject.drewImage(this);
        };
        img.src = src;
    })
});

function sendAjaxReq(verb, data, api, success, error) {
    $.ajax({
        type: verb,
        datatype: "json",
        data: data ? JSON.stringify(data) : {},
        url: `http://localhost:5000/${api}`,
        contentType: "application/json; charset=utf-8",
        success,
        error
    });
}

function loadImagesFromServer() {
    sendAjaxReq('GET', null, 'images', (res) => {
        initImages(res);
    }, () => {
        alert('image get error');
    })
}

function deleteImages() {
    sendAjaxReq('DELETE', null, 'images', (res) => {
        initImages(res);
    }, () => {
        alert('image get error');
    })
}

function initImages(images) {
    $('#imagesList').html('');
    images.forEach(img => {
        $('#imagesList').append(`<img src="${img.src}" class="image-item"/>`);
    })
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

