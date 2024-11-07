// declare global {
//   // hack: fix type.
//   interface FontFaceSet {
//     add(font: FontFace): FontFaceSet
//   }
// }

// export type Assets = {
//   readonly club9I: HTMLImageElement
//   readonly cursor: HTMLImageElement
//   readonly fairway: HTMLImageElement
//   readonly font: FontFace
// }

// export async function Assets(): Promise<Assets> {
//   const fontFace = new FontFace('mem', 'url(assets/mem-prop-5x6.ttf)')
//   const [club9I, cursor, fairway, font] = await Promise.all([
//     loadImage('assets/club-9i.webp'),
//     loadImage('assets/cursor.webp'),
//     loadImage('assets/fairway.webp'),
//     await fontFace.load()
//   ])
//   return {club9I, cursor, fairway, font}
// }

// async function loadAudio(url: string): Promise<ArrayBuffer> {
//   const rsp = await fetch(url)
//   if (!rsp.ok) throw Error(`HTTP error ${rsp.status}: ${rsp.statusText}`)
//   return await rsp.arrayBuffer()
// }
