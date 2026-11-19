// Fit intrinsic pill content to this native window; never change metric ordering.
export function fitMetrics(content,display,scale=1){
 if(display.hidden||!display.children.length)return;
 display.style.fontSize='20px';
 const width=display.scrollWidth,height=display.scrollHeight;
 const availableWidth=content.clientWidth-8;
 const availableHeight=content.clientHeight-8;
 if(width>0&&height>0&&availableWidth>0&&availableHeight>0){
  const fit=Math.min(availableWidth/width,availableHeight/height);
  display.style.fontSize=`${Math.max(1,20*fit*scale)}px`;
 }
}
