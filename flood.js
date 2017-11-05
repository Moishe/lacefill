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

function processQueueItem(ctx, item, c, ogc) {
    var x = item[1];
    var y = item[2];

    if (x < 0 || y < 0 || x > 500 || y > 500) {
        return;
    }

    if (item[0] == 'r') {
        var curc = getRgbPixel(x,y);
        if (!rgbClose(curc, ogc)) {
            return;
        }

        enqueue(['r', x - 1, y]);
        enqueue(['r', x + 1, y]);
        enqueue(['r', x, y - 1]);
        enqueue(['r', x, y + 1]);

//       ctx.fillStyle = "rgba("+0+","+0+","+0+","+1+")";
//       ctx.fillRect( x, y, 1, 1 );
        enqueue(['d', x, y, curc, 1])
    } else if (item[0] == 'd') {
       var curc = item[3];
       var idx = item[4];
       var r = Math.max(0, curc[0] - (idx * 10));
       var g = Math.max(0, curc[1] - (idx * 20));
       var b = Math.max(0, curc[2] - (idx * 20));


       ctx.fillStyle = "rgba("+r+","+g+","+b+","+1+")";
       ctx.fillRect( x, y, 1, 1 );

       if (r == 0 && g == 0 && b == 0) {
           return;
       }

        enqueue(['d', x, y, curc, idx + 1])
    }
}

var queue = [];
var second_queue = [];
var fade_queue = [];
var seen_coords = {};
const max = 200;

function enqueue(item) {

    if (item[0] == 'r') {
        if (item[1] * 500 + item[2] in seen_coords) {
            return;
        }

        seen_coords[item[1] * 500 + item[2]] = 1;
        if (Math.random() < (queue.length / 100)) {
            second_queue.push(item);
        }else{
            queue.push(item);
        }
    } else {
        fade_queue.push(item);
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
        processQueueItem(ctx, item, c, ogc);
    }

    var fade_queue_intact = fade_queue.splice(0, fade_queue.length);
    while (fade_queue_intact.length) {
        processQueueItem(ctx, fade_queue_intact.pop(), c, ogc);
    }

    return cnt;
}

function processQueue(ctx, c, ogc) {
    var cnt = processSubqueue(ctx, c, ogc, queue, second_queue, 0);
    setTimeout(function() { processQueue(ctx, c, ogc); }, 0);
}

function floodFill(ctx, x, y) {
    enqueue(['r', x, y]);

    var ogc = ctx.getImageData(x, y, 1, 1).data.slice(0,3);

    processQueue(ctx, ogc, ogc);
}
