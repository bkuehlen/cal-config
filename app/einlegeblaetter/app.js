
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let calendarVendor = params.vendor;
let calendarYear = parseInt(params.year);
let pageNum = parseInt(params.page);

//Reading JSON File
function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
          callback(rawFile.responseText);
      }
  }
  rawFile.send(null);
}

var pageParams = null;

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.1.81/pdf.worker.min.js';


//usage:
readTextFile(calendarVendor + "/" + calendarYear + "/links.json", function(text){
  var data = JSON.parse(text);
  pageParams = data[pageNum-1];
  console.log(pageParams);
  
  /**
   * Asynchronously downloads PDF.
   */
  // pageParams.pdfUrl;
  pdfjsLib.getDocument(pageParams.pdf).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    var pdf = pdfDoc_;

    //document.getElementById('page_count').textContent = pdfDoc.numPages;
    pdf.getPage(pageNum).then(function(page) {
      // you can now use *page* here
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

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

      canvas.addEventListener('mousedown', function(e) {
        handleClickOnCursorPosition(canvas, e)
      });

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

});

//Get Mouse Position in Canvas
function handleClickOnCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const xPercent = x / canvas.width;
  const yPercent = y / canvas.height;

  console.log("xPercent: " + xPercent + " yPercent: " + yPercent);

  //Check if click is in a link box
  for (var i = 0; i < pageParams.regions.length; i++) {
      //console.log(pageParams.regions[i]);

      if( xPercent > pageParams.regions[i].x && xPercent < pageParams.regions[i].x + pageParams.regions[i].width) {
        if( yPercent > pageParams.regions[i].y && yPercent < pageParams.regions[i].y + pageParams.regions[i].height) {
          console.log(pageParams.regions[i].target);

          window.location.href = pageParams.regions[i].target.replace("https://", "sblank://").replace("http://", "blank://");
        }
      }
  }
}