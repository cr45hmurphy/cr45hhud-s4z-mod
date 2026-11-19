// Sauce segment objects carry `name` and `loop` but no explicit type. Classify conservatively:
// loop flag first, then name keywords. Anything unrecognised stays neutral ('other').
export const kindLabel={sprint:'Sprint',climb:'Climb',loop:'Loop',other:'Segment'};
// Segments whose names carry no keyword. Checked against Sauce getSegments for courses 2-18
// (2026-11-14); archId did not resolve these, so they are listed explicitly.
const NAMED={'23rd st.':'climb','broad st.':'sprint','fuego flats':'sprint','uci worlds':'loop'};
export function segmentKind(seg){
 if(seg?.loop===true)return 'loop';
 const n=String(seg?.name||'');
 const base=n.trim().toLowerCase().replace(/\s+reverse$/,'');
 if(NAMED[base])return NAMED[base];
 if(/sprint|prime/i.test(n))return 'sprint';
 if(/kom|qom|climb|hill|mountain|alpe|ventoux|grade|ascent|summit|kicker|brae/i.test(n))return 'climb';
 return 'other';
}
