import {Devvit} from '@devvit/public-api'

export const previewVersion: number = 0

export function Preview(): JSX.Element {
  // to-do: this should be a checkerboard or checkerboard-based animation.
  return (
    <vstack width={'100%'} height={'100%'} alignment='center middle'>
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
