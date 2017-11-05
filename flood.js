var imageData = undefined;

function getRgbPixel(x,y) {
    var idx = (y * 500 + x) * 4;
    var r = imageData.data.slice(idx, idx + 3);
    return r;
}

function loadImage() {
    var cvs = document.getElementById('test1');
    if (cvs.getContext) {

        ctx = cvs.getContext('2d');

        //Loading of the home test image - img1
        var img1 = new Image();

        //drawing of the test image - img1
        img1.onload = function () {
            //draw background image
            ctx.drawImage(img1, 0, 0);
        imageData = ctx.getImageData(0, 0, 500, 500);
        };

        img1.src = 'img.png';
    }

    var elemLeft = cvs.offsetLeft,
    elemTop = cvs.offsetTop,
    context = cvs.getContext('2d'),
    elements = [];

    // Add event listener for `click` events.
    cvs.addEventListener('click', function(event) {
        var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;

        floodFill(ctx, x, y);
    }, false);
}

function rgbClose(a1, a2) {
    var sumSquares = 0;
    for (var i = 0; i < 3; i++) {
        sumSquares += Math.pow(a1[i] - a2[i], 2);
    }

    return Math.sqrt(sumSquares) < 50;
}

function interpolate(o, n, step, steps){
    return Math.floor(o - ((o - n) * (step / steps)));
}

function processQueueItem(ctx, x, y, c, ogc) {
    if (x < 0 || y < 0 || x > 500 || y > 500) {
    return;
    }

    var curc = getRgbPixel(x,y);
    if (!rgbClose(curc, ogc)) {
        return;
    }

    var idx = 1;
    var max = 5;
/*
    var decayer = setInterval(function(){
       var r = Math.max(0, curc[0] - (idx * 50));
       var g = Math.max(0, curc[1] - (idx * 100));
       var b = Math.max(0, curc[2] - (idx * 100));
       if (r == 0 && g == 0 && b == 0) {
           clearInterval(decayer);
       }

       ctx.fillStyle = "rgba("+r+","+g+","+b+","+1+")";
       ctx.fillRect( x, y, 1, 1 );

       idx = idx + 1;
    }, 0);
*/
   ctx.fillStyle = "rgba(0,0,0,1)";
   ctx.fillRect( x, y, 1, 1 );
    enqueue([x - 1, y]);
    enqueue([x + 1, y]);
    enqueue([x, y - 1]);
    enqueue([x, y + 1]);
}

var queue = [];
var second_queue = [];
var seen_coords = {};
const max = 50;

function enqueue(item) {

    if (!(item[0] * 500 + item[1] in seen_coords)) {
        seen_coords[item[0] * 500 + item[1]] = 1;

        if (Math.random() < (queue.length / 50)) {
            second_queue.push(item);
        }else{
            queue.push(item);
        }
    }
}

function processSubqueue(ctx, c, ogc, q, q2, cnt) {
    for (let i = 0; i < max; i++) {
        var item;
        if (q.length) {
            var idx = Math.floor(Math.random() * q.length);
            item = q.splice(idx, 1)[0];
        } else if (q2.length) {
            item = q2.pop();
        } else {
            break;
        }
        processQueueItem(ctx, item[0], item[1], c, ogc);
    }

    return cnt;
}

function processQueue(ctx, c, ogc) {
    var cnt = processSubqueue(ctx, c, ogc, queue, second_queue, 0);
/*
    if (!queue.length){
        processSubqueue(ctx, c, ogc, second_queue, cnt);
    }
*/
    setTimeout(function() { processQueue(ctx, c, ogc); }, 0);
}

function floodFill(ctx, x, y) {
    enqueue([x, y]);

    var ogc = ctx.getImageData(x, y, 1, 1).data.slice(0,3);

    processQueue(ctx, ogc, ogc);
}
