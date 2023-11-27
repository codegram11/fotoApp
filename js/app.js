document.addEventListener('DOMContentLoaded', function () {
    const camera = document.getElementById('camera');
    const captureBtn = document.getElementById('capture-btn');
    const printBtn = document.getElementById('print-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const previewContainer = document.getElementById('photo-preview');

    let capturedPhotos = [];
    let imagesLoaded = 0;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            camera.srcObject = stream;
        })
        .catch(error => console.error('Error al acceder a la cámara:', error));

    function capturePhoto() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = camera.videoWidth;
        canvas.height = camera.videoHeight;

        context.drawImage(camera, 0, 0, canvas.width, canvas.height);

        const photoUrl = canvas.toDataURL('image/png');
        capturedPhotos.push(photoUrl);

        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photo-container');

        const img = document.createElement('img');
        img.src = photoUrl;
        img.classList.add('photo');
        photoContainer.appendChild(img);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'x';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function () {
            deletePhoto(photoContainer);
        });
        photoContainer.appendChild(deleteBtn);

        previewContainer.appendChild(photoContainer);

        if (capturedPhotos.length === 4) {
            enablePrintButton();
        }
    }

    function deletePhoto(photoContainer) {
        const index = Array.from(previewContainer.children).indexOf(photoContainer);
        capturedPhotos.splice(index, 1);
        previewContainer.removeChild(photoContainer);

        if (capturedPhotos.length < 4) {
            disablePrintButton();
        }
    }

    function enablePrintButton() {
        printBtn.style.display = 'block';
    }

    function disablePrintButton() {
        printBtn.style.display = 'none';
    }

    function handleImageLoad() {
        imagesLoaded++;

        if (imagesLoaded === 5) {
            const collageCanvas = document.createElement('canvas');
            collageCanvas.width = (camera.videoWidth + 10) * 2;
            collageCanvas.height = (camera.videoHeight + 10) * 2;
            const collageContext = collageCanvas.getContext('2d');

            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = capturedPhotos[i];

                const x = (i % 2) * (camera.videoWidth + 10);
                const y = Math.floor(i / 2) * (camera.videoHeight + 10);

                collageContext.drawImage(img, x, y, camera.videoWidth, camera.videoHeight);
            }

            const marcoImg = new Image();
            marcoImg.src = 'img/marco.png';
            marcoImg.onload = function () {
                collageContext.drawImage(marcoImg, 0, 0, collageCanvas.width, collageCanvas.height);

                // Utiliza Print.js para imprimir el collage directamente
                printJS({
                    printable: collageCanvas.toDataURL('image/png'),
                    type: 'image',
                    base64: true,
                    paper_size: [10.5, 14.8], // Tamaño de papel en centímetros (A6)
                    silent: true, // Modo de impresión silenciosa
                    onPrintDialogClose: function () {
                        // Limpia el estado después de la impresión
                        resetState();
                        // Inicia automáticamente la captura de nuevas fotos
                        captureNewPhotos();
                    }
                });
            };
        }
    }

    function captureNewPhotos() {
        capturedPhotos = [];
        imagesLoaded = 0;
        disablePrintButton();
    }

    function printCollage() {
        const marcoImg = new Image();
        marcoImg.src = 'img/marco.png';
        marcoImg.onload = function () {
            imagesLoaded = 0;

            handleImageLoad();

            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = capturedPhotos[i];
                img.onload = handleImageLoad;
            }
        };
    }

    function resetState() {
        capturedPhotos = [];
        previewContainer.innerHTML = '';
        disablePrintButton(); // Oculta el botón de imprimir
    }

    captureBtn.addEventListener('click', function () {
        if (capturedPhotos.length < 4) {
            capturePhoto();
        } else {
            alert('Ya has capturado 4 fotos');
        }
    });

    deleteAllBtn.addEventListener('click', function () {
        resetState();
    });

    printBtn.addEventListener('click', function () {
        if (capturedPhotos.length === 4) {
            printCollage();
        } else {
            alert('Captura 4 fotos antes de imprimir');
        }
    });
});
