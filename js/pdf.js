// ---------- PDF reader ----------
// Put your PDFs in assets/files/ with these exact names.
const pdfFiles = [
  { name: "about-me.pdf", src: "assets/files/about-me.pdf" },
  { name: "my-thoughts.pdf", src: "assets/files/my-thoughts.pdf" },
];

// pdf.js needs this worker file to read PDFs in the background
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const pdfCanvas = document.getElementById("pdf-canvas");
const pdfInfo = document.getElementById("pdf-info");
const pdfStatus = document.getElementById("pdf-status");
const pdfList = document.getElementById("pdf-files");

let pdfDoc = null;
let pdfPage = 1;
let activeFile = null;
let renderTask = null;

// Draws the file list in the sidebar
function renderFileList() {
  pdfList.innerHTML = "";
  pdfFiles.forEach((file) => {
    const row = document.createElement("div");
    row.className = "pdf-file" + (file === activeFile ? " active" : "");
    row.textContent = file.name;
    row.addEventListener("click", () => openPdf(file));
    pdfList.appendChild(row);
  });
}

async function openPdf(file) {
  activeFile = file;
  renderFileList();
  pdfStatus.textContent = "Loading...";
  try {
    pdfDoc = await pdfjsLib.getDocument(file.src).promise;
    pdfPage = 1;
    await renderPage();
    pdfStatus.textContent = file.name;
  } catch (err) {
    pdfDoc = null;
    pdfInfo.textContent = "";
    pdfStatus.textContent = "Could not open. Use Live Preview.";
  }
}

// Draws the current page onto the canvas
async function renderPage() {
  if (!pdfDoc) return;

  if (renderTask) renderTask.cancel();

  const page = await pdfDoc.getPage(pdfPage);
  const viewport = page.getViewport({ scale: 1.4 });
  pdfCanvas.width = viewport.width;
  pdfCanvas.height = viewport.height;

  renderTask = page.render({
    canvasContext: pdfCanvas.getContext("2d"),
    viewport: viewport,
  });

  try {
    await renderTask.promise;
  } catch (err) {
    // A cancelled draw is expected when you click quickly. Ignore it.
  }

  pdfInfo.textContent = `Page ${pdfPage} of ${pdfDoc.numPages}`;
}

document.getElementById("pdf-prev").addEventListener("click", () => {
  if (pdfDoc && pdfPage > 1) {
    pdfPage--;
    renderPage();
  }
});

document.getElementById("pdf-next").addEventListener("click", () => {
  if (pdfDoc && pdfPage < pdfDoc.numPages) {
    pdfPage++;
    renderPage();
  }
});

// Start up
renderFileList();