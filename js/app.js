document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var captureButton = document.getElementById('capture');
    var ctx = canvas.getContext('2d');
    var collageImages = [];
    var currentPhoto = 1;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
        })
        .catch(function (error) {
            console.log('Error al acceder a la cámara: ', error);
        });

    captureButton.addEventListener('click', function () {
        if (currentPhoto <= 4) {
            // Ajustar el tamaño del lienzo al tamaño de impresión (10 x 15 cm)
            canvas.width = 10 * 2.54 * window.devicePixelRatio;
            canvas.height = 15 * 2.54 * window.devicePixelRatio;

            // Dibujar la imagen desde la cámara en el lienzo
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Agregar la imagen al collage
            collageImages.push(canvas.toDataURL('image/png'));

            // Actualizar el texto del botón con el número de la foto actual
            captureButton.textContent = 'Tomar Foto ' + (currentPhoto + 1);

            // Incrementar el número de la foto actual
            currentPhoto++;
        }

        if (currentPhoto > 4) {
            // Al tomar las 4 fotos, imprimir automáticamente
            printCollage();
        }
    });

    function printCollage() {
        // Ajustar el tamaño del lienzo al tamaño de impresión (10 x 15 cm)
        canvas.width = 10 * 2.54 * window.devicePixelRatio * 2; // Doble ancho para 2x2 collage
        canvas.height = 15 * 2.54 * window.devicePixelRatio * 2; // Doble alto para 2x2 collage

        // Limpiar el lienzo
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar cada imagen en el collage
        for (var i = 0; i < collageImages.length; i++) {
            var img = new Image();
            img.src = collageImages[i];

            // Calcular la posición y el tamaño de cada foto en el collage
            var x = (i % 2) * (canvas.width / 2);
            var y = Math.floor(i / 2) * (canvas.height / 2);
            var width = canvas.width / 2;
            var height = canvas.height / 2;

            // Dibujar la imagen en el lienzo
            ctx.drawImage(img, x, y, width, height);
        }

        // Abrir una nueva ventana y escribir directamente el contenido del collage
        var printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write('<html><head><title>Collage de Fotos</title></head>');
        printWindow.document.write('<body><img src="' + canvas.toDataURL('image/png') + '" style="width: 100%; height: auto;"></body>');
        printWindow.document.write('</html>');
        printWindow.document.close();

        //
