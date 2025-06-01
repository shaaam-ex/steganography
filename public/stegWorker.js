// public/stegWorker.js
self.onmessage = function(e) {
    const { imageData, width, height } = e.data;
    const data = new Uint8ClampedArray(imageData);
    let binaryString = '';
    let foundEnd = false;

    for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            const bit = data[i + j] & 1;
            binaryString += bit.toString();

            // Check every 8 bits for [END] marker
            if (binaryString.length % 8 === 0) {
                const byte = binaryString.substr(-8);
                const char = String.fromCharCode(parseInt(byte, 2));

                if (char === ']' &&
                    binaryString.length >= 40 &&
                    binaryString.substr(-40, 5) === '0101101101000101010011100100010001011101') {
                    foundEnd = true;
                    break;
                }
            }
        }
        if (foundEnd) break;

        // Yield control every 1000 pixels to prevent freezing
        if (i % 4000 === 0) {
            setTimeout(() => {}, 0);
        }
    }

    if (foundEnd) {
        const messageBinary = binaryString.slice(0, -40);
        let message = '';

        for (let i = 0; i < messageBinary.length; i += 8) {
            const byte = messageBinary.substr(i, 8);
            if (byte.length === 8) {
                message += String.fromCharCode(parseInt(byte, 2));
            }
        }

        self.postMessage({ success: true, message });
    } else {
        self.postMessage({ success: false, error: "No message found" });
    }
};