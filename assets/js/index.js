const messageEmptyGallery = document.querySelector(`[data-js-message="empty-gallery"]`);
const addImageButton = document.querySelector(`[data-js-button="add-image"]`);
const imagesContainer = document.querySelector(`[data-js-container="images"]`);
const preloaderPage = document.querySelector(`[data-js-preloader="preloader"]`);
const inputUpload = document.querySelector(`[data-js-input="upload"]`);
const loaderPage = document.querySelector(`[data-js-loader="loader"]`);
const localStorageKeyName = `images`;
let dataLocalStorage = null;
let imagesArray = [];

const getDataLocalStorage = () => {
    return JSON.parse(localStorage.getItem(localStorageKeyName));
};

const setDataLocalStorage = () => {
    localStorage.setItem(localStorageKeyName, JSON.stringify(imagesArray));
};

// const clearLocalStorage = () => {
//     setTimeout(() => {
//         localStorage.clear();
//     }, 5000);
// };
// clearLocalStorage();

const checkIfGalleryIsEmpty = () => {
    dataLocalStorage.length > 0 ? messageEmptyGallery.style.display = 'none' : ``;
};

const renderImages = () => {
    if (dataLocalStorage !== null) {
        imagesArray = getDataLocalStorage();
        checkIfGalleryIsEmpty();

        imagesArray.forEach((data) => {
            imagesContainer.innerHTML += `
                <div data-js-timestamp="${data.timestamp}">
                    <img src="${data.src}" alt="Imagem" width="200" height="200" />
                    <button data-js-button="delete">Delete</button>
                </div>
            `;
        });
    }
};

const instanceateNewImage = () => {
    return new Image();
};

const instanceateNewFileReader = () => {
    return new FileReader();
};

const createElementFN = (elementName) => {
    return document.createElement(elementName);
};

const addTextContent = (element, text) => {
    element.textContent = text;
};

const appendChildFN = (parentElement, child) => {
    parentElement.appendChild(child);
};

const setAttributeFN = (element, attribuite, value) => {
    element.setAttribute(attribuite, value);
};

const removeClassFN = (element, classname) => {
    element.classList.remove(classname);
};

const clearInputUpload = () => {
    inputUpload.value = ``;
};

const pageReload = () => {
    location.reload();
};

const confirmFN = (message) => {
    return confirm(message);
};

const pagePreloaderAndLoader = () => {
    setTimeout(() => {
        removeClassFN(preloaderPage, `c-body__c-preloader`);
        removeClassFN(loaderPage, `c-body__c-loader`);
    }, 1280);
};

const convertStringToNumber = (string) => {
    return Number(string);
};

const readAsDataUrlFN = (fileReader, file) => {
    fileReader.readAsDataURL(file);
};

const compressImage = (result, quality) => {
    return new Promise((resolve) => {

        const image = instanceateNewImage();

        image.onload = () => {
            const canvas = createElementFN(`canvas`);
            const dimension = `2d`;
            const contextCanvas = canvas.getContext(dimension);
            const maxWidth = 600;

            let width = image.width;
            let height = image.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            contextCanvas.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob) => {
                const compressedReader = instanceateNewFileReader();

                compressedReader.onload = () => {
                    object = {
                        blobSize: blob.size,
                        compressedReader: compressedReader.result,
                    };
                    resolve(object);
                };

                readAsDataUrlFN(compressedReader, blob)
            },
                'image/jpeg', quality
            );
        };

        image.src = result;
    });
};

addImageButton.addEventListener('click', () => {
    const filesList = inputUpload.files;

    if (filesList.length === 0) {
        alert(`Escolha um arquivo!`);
        return;
    }

    const file = filesList[0];
    const fileSize = filesList[0].size;

    const fileReader = instanceateNewFileReader();
    readAsDataUrlFN(fileReader, file);

    fileReader.onload = async () => {
        const result = fileReader.result;
        const quality = 0.7;
        const { blobSize, compressedReader } = await compressImage(result, quality);

        const objectImage = {
            originalSize: fileSize,
            modifiedSize: blobSize,
            timestamp: Date.now(),
            src: compressedReader,
        };

        imagesArray.unshift(objectImage);
        setDataLocalStorage();
        dataLocalStorage = getDataLocalStorage();
        checkIfGalleryIsEmpty();

        const baseStructure = createElementFN(`div`);
        setAttributeFN(baseStructure, `data-js-timestamp`, objectImage.timestamp);

        const image = createElementFN(`img`);
        setAttributeFN(image, `src`, objectImage.src);
        setAttributeFN(image, `alt`, `Imagem`);
        setAttributeFN(image, `width`, `200`);
        setAttributeFN(image, `height`, `200`);

        const deleteButton = createElementFN(`button`);
        setAttributeFN(deleteButton, `data-js-button`, `delete`);
        addTextContent(deleteButton, `Deletar`);

        appendChildFN(baseStructure, image);
        appendChildFN(baseStructure, deleteButton);
        appendChildFN(imagesContainer, baseStructure)

        clearInputUpload();
        pageReload();
    };
});

window.document.addEventListener(`click`, (event) => {
    const eventTarget = event.target;
    const isButtonDelete = (eventTarget.dataset.jsButton === `delete`);

    if (!isButtonDelete) return;

    const wantDelete = confirmFN('Realmente deseja deletar a imagem?');

    if (!wantDelete) return;

    let parentElement = null;
    let parentElementTimestamp = null;

    if (isButtonDelete) {
        parentElement = eventTarget.parentElement;
        parentElementTimestamp = Number(parentElement.dataset.jsTimestamp);

        imagesArray.forEach((data) => {
            if (data.timestamp === parentElementTimestamp) {
                imagesArray = imagesArray.filter((data) => data.timestamp !== parentElementTimestamp);
            }
            setDataLocalStorage();
            parentElement.remove();
            pageReload();
        });
    }
});

window.document.addEventListener(`DOMContentLoaded`, () => {
    dataLocalStorage = getDataLocalStorage();
    renderImages();
    pagePreloaderAndLoader();
});