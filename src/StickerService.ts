import {DokiTheme} from "./DokiTheme";
import path from 'path';
import fs from "fs";

export enum InstallStatus {
  INSTALLED, NOT_INSTALLED, FAILURE
}

const main = require.main || {filename: 'yeet'};
export const workbenchDirectory = path.join(path.dirname(main.filename), 'vs', 'workbench');
const editorCss = path.join(workbenchDirectory, 'workbench.desktop.main.css');
const editorCssCopy = path.join(workbenchDirectory, 'workbench.desktop.main.css.copy');

function getVsCodeCss() {
  // todo: check to see if the current css has stickers if installed (ie they upgraded)
  if (!fs.existsSync(editorCssCopy)) {
    fs.copyFileSync(editorCss, editorCssCopy);
  }
  return fs.readFileSync(editorCssCopy, 'utf-8');
}

function buildStickerCss(dokiTheme: DokiTheme): string {
  const stickerUrl = dokiTheme.sticker.url;
  const backgroundImage = dokiTheme.name.toLowerCase();
  const style = 'content:\'\';pointer-events:none;position:absolute;z-index:99999;width:100%;height:100%;background-position:100% 100%;background-repeat:no-repeat;opacity:1;';
  return `
  /* Stickers */
  .split-view-view .editor-container .editor-instance>.monaco-editor .overflow-guard>.monaco-scrollable-element::after{background-image: url('${stickerUrl}');${style}}

  /* Background Image */
  .monaco-workbench .part.editor > .content {
    background-image: url('https://doki.assets.acari.io/backgrounds/${backgroundImage}.png') !important;
    background-position: center;
    background-size: cover;
    content:'';
    z-index:99999;
    width:100%;
    height:100%;
    background-repeat:no-repeat;
    opacity:1;
}
`;
}

function buildStyles(dokiTheme: DokiTheme): string {
  let vsCodeCss = getVsCodeCss();
  return vsCodeCss + buildStickerCss(dokiTheme);

}
function installEditorStyles(styles: string) {
  fs.writeFileSync(editorCss, styles, 'utf-8');
}

function canWrite(): boolean {
  try {
    fs.accessSync(editorCss, fs.constants.W_OK);
    return true;
  } catch(error){
    return false;
  }
}

export function installSticker(dokiTheme: DokiTheme): boolean {
  if(canWrite()) {
    const stickerStyles = buildStyles(dokiTheme);
    installEditorStyles(stickerStyles);
    return true;
  } else {
    return false;
  }
}

// :(
export function removeStickers(): InstallStatus {
  if(canWrite()) {
    if (fs.existsSync(editorCssCopy)) {
      fs.unlinkSync(editorCss);
      fs.copyFileSync(editorCssCopy, editorCss);
      fs.unlinkSync(editorCssCopy);
      return InstallStatus.INSTALLED;
    }
    return InstallStatus.NOT_INSTALLED;
  }

  return InstallStatus.FAILURE;
}