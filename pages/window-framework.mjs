// Native Sauce behavior; see MOD-WINDOW-FRAMEWORK-REQUIREMENTS.md.
export function applyWindowSettings(common,cfg){
    common.setBackground(cfg);
    document.body.style.setProperty('--scale',cfg.fontScale);
    document.body.style.setProperty('--bar-thickness',`${cfg.barThickness}px`);
    document.body.style.setProperty('--pscale',String(cfg.hudProgressScale??1));
    document.body.style.setProperty('--hud-alpha',String(cfg.opacity));
    for(const [key,attr] of [['cornerStyle','corners'],['hudCorners','hudcorners'],['segmentPalette','palette'],['density','density'],['riderMarker','rider'],['textOutline','outline'],['nextColor','nextcolor']])document.body.dataset[attr]=cfg[key];
}
