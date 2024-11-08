import {Devvit} from '@devvit/public-api'

export const previewVersion: number = 0

export function Preview(): JSX.Element {
  // to-do: this should be a golf bag silhouette or tiled pattern.
  return (
    <vstack
      width={'100%'}
      height={'100%'}
      alignment='center middle'
      backgroundColor='#9ecc8e' //to-do:palette
    >
      <image
        url='loading.gif'
        description='loading…'
        height='140px'
        width='140px'
        imageHeight='240px'
        imageWidth='240px'
      />
    </vstack>
  )
}
