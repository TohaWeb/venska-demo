import * as nodePath from 'path';

const rootFolder = nodePath.basename(nodePath.resolve());

// The site is a static page: index.html lives in the project root,
// compiled css/js go next to the images in ../assets
const buildFolder = '../assets',
    siteRoot = '../',
    srcFolder = './src';

export const path = {
    build: {
        html: siteRoot,
        css: `${buildFolder}/css/`,
        js: `${buildFolder}/js/`,
        files: `${buildFolder}`
    },
    src: {
        html: `${srcFolder}/html/*.html`,
        scss: `${srcFolder}/scss/style.scss`,
        js: `${srcFolder}/js/main.js`,
        files: `${srcFolder}/**/*.*`,
    },
    watch: {
        files: `${srcFolder}/**/*.*`,
        html: `${srcFolder}/**/*.html`,
        js: `${srcFolder}/js/**/*.js`,
        scss: `${srcFolder}/scss/**/*.scss`,
    },
    // ../assets also holds the images, so only the generated folders are cleaned
    clean: [`${buildFolder}/css`, `${buildFolder}/js`],
    buildFolder: buildFolder,
    srcFolder: srcFolder,
    rootFolder: rootFolder,
}
