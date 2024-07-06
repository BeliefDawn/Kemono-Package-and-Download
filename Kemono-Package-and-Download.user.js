// ==UserScript==
// @name         Kemono 打包下载
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Download images from kemono.su, rename and zip them
// @author       ChatGPT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kemono.su
// @match        https://kemono.su/*/user/*/post/*
// @match        https://kemono.party/*/user/*/post/*
// @require      https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to download an image and add to zip
    function addImageToZip(url, filename, zip) {
        return fetch(url)
            。then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching ${url}`);
                }
                return response.blob();
            })
            。then(blob => {
                zip.file(filename, blob);
            })
            。catch(err => {
                console.error(err);
            });
    }

    // Function to process images and add them to zip
    async function processImages(images, zip, title) {
        for (let index = 0; index < images.length; index++) {
            let img = images[index];
            let imgUrl = img.href;
            if (imgUrl) {
                let extension = imgUrl.split('.').pop().split(/\#|\?/)[0];
                let filename = `${title}-${('0' + (index + 1)).slice(-2)}.${extension}`;
                await addImageToZip(imgUrl, filename, zip);
            }
        }
    }

    // Function to start the download process
    async function startDownload() {
        // Get the title
        let titleElement = document.querySelector('.post__title');
        let title = titleElement ? titleElement.textContent.trim().replace('(Pixiv Fanbox)', '').trim() : 'download';

        // Get the images
        let images = document.querySelectorAll('.post__files a');
        if (images.length === 0) {
            console.log('No images found.');
            return;
        }

        // Create a new zip instance
        let zip = new JSZip();

        // Start processing images and adding them to zip
        await processImages(images, zip, title);

        // Generate the zip file and trigger the download
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, `${title}.zip`);
        });
    }

    // Create and style the download button
    function createDownloadButton() {
        let button = document.createElement('button');
        button.innerText = 'Download Images as ZIP';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = 1000;
        button.style.padding = '10px';
        button.style.backgroundColor = '#007bff';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', startDownload);
        document.body.appendChild(button);
    }

    // Wait for the document to fully load before adding the button
    window.addEventListener('load', () => {
        createDownloadButton();
    });
})();
