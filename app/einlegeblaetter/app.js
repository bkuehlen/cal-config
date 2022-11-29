// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.1.81/pdf.worker.min.js';

var hash = window.location.hash.substring(1);
var result = hash.split('&').reduce(function (res, item) {
    var parts = item.split('=');
    res[parts[0]] = parts[1];
    return res;
}, {});

var url = 'https://bkuehlen.github.io/cal-config/app/einlegeblaetter/' + result.vendor + '/' + result.year + '/einlagen.pdf';
var pageNum = parseInt(result.page);

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  var pdf = pdfDoc_;

  console.log("Num Pages: " + pdfDoc.numPages);
  //document.getElementById('page_count').textContent = pdfDoc.numPages;
  pdf.getPage(pageNum).then(function(page) {
    // you can now use *page* here
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

    console.log(page._pageInfo.view[2]);
    console.log(vw);
    var scale = vw / page._pageInfo.view[2];
    var viewport = page.getViewport({ scale: scale, });
    // Support HiDPI-screens.
    var outputScale = window.devicePixelRatio || 1;

    var canvas = document.getElementById('the-canvas');
    var context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height =  Math.floor(viewport.height) + "px";

    var transform = outputScale !== 1
    ? [outputScale, 0, 0, outputScale, 0, 0]
    : null;

    var renderContext = {
    canvasContext: context,
    transform: transform,
    viewport: viewport
    };
    page.render(renderContext);

  });
  
  // Initial/first page rendering
  //renderPage(pageNum);
});
