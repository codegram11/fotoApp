document.addEventListener('DOMContentLoaded', function () {
    const camera = document.getElementById('camera');
    const captureBtn = document.getElementById('capture-btn');
    const printBtn = document.getElementById('print-btn');
    const newPhotosBtn = document.getElementById('new-photos-btn');
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
        deleteBtn.addEventListener('click', function() {
            deletePhoto(photoContainer);
        });
        photoContainer.appendChild(deleteBtn);

        previewContainer.appendChild(photoContainer);
    }

    function deletePhoto(photoContainer) {
        const index = Array.from(previewContainer.children).indexOf(photoContainer);
        capturedPhotos.splice(index, 1);
        previewContainer.removeChild(photoContainer);
    }

    function handleImageLoad() {
        imagesLoaded++;

        if (imagesLoaded === 5) {
            const collageCanvas = document.createElement('canvas');
            collageCanvas.width = (camera.videoWidth + 10) * 2; // Ancho total con espacio entre fotos
            collageCanvas.height = (camera.videoHeight + 10) * 2; // Alto total con espacio entre fotos
            const collageContext = collageCanvas.getContext('2d');

            // Cargar las fotos primero
            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = capturedPhotos[i];

                const x = (i % 2) * (camera.videoWidth + 10); // Ancho total con espacio entre fotos
                const y = Math.floor(i / 2) * (camera.videoHeight + 10); // Alto total con espacio entre fotos

                collageContext.drawImage(img, x, y, camera.videoWidth, camera.videoHeight);
            }

            // Luego, cargar el marco
            const marcoImg = new Image();
            marcoImg.src = 'img/marco.png';
            marcoImg.onload = function () {
                collageContext.drawImage(marcoImg, 0, 0, collageCanvas.width, collageCanvas.height);

                const printWindow = window.open('', '_blank');
                printWindow.document.write('<html><head><title>Fotos</title></head><body>');
                printWindow.document.write(`<img id="printed-collage" src="${collageCanvas.toDataURL('image/png')}" style="width:100%;height:100%;">`);
                printWindow.document.write('</body></html>');
                printWindow.document.close();

                const printedCollage = printWindow.document.getElementById('printed-collage');
                printedCollage.onload = function () {
                    printWindow.print();
                };
            };
        }
    }

    function printCollage() {
        const marcoImg = new Image();
        marcoImg.src = 'img/marco.png';
        marcoImg.onload = function () {
            imagesLoaded = 0;

            // Disparar la carga del marco
            handleImageLoad();

            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = capturedPhotos[i];
                img.onload = handleImageLoad;
            }
        };
    }

    captureBtn.addEventListener('click', function () {
        if (capturedPhotos.length < 4) {
            capturePhoto();
        } else {
            alert('Ya has capturado 4 fotos');
        }
    });

    printBtn.addEventListener('click', function () {
        if (capturedPhotos.length === 4) {
            printCollage();
        } else {
            alert('Captura 4 fotos antes de imprimir');
        }
    });

    newPhotosBtn.addEventListener('click', function () {
        capturedPhotos = [];
        previewContainer.innerHTML = '';
        newPhotosBtn.style.display = 'none';
    });
});
