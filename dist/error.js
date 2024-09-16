"use strict";
// src/lib/error.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.showError = showError;
/** Helper method to output an error message to the screen */
function showError(errorText) {
    console.error(errorText);
    const errorBoxDiv = document.getElementById('error-box');
    if (!errorBoxDiv) {
        console.error('Error box not found');
        return;
    }
    const errorElement = document.createElement('p');
    errorElement.innerText = errorText;
    errorBoxDiv.appendChild(errorElement);
}
