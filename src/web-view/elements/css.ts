import {paletteBlack, paletteWhite} from '../../shared/types/palette.js'
import {halfSpacePx, quarterSpacePx, spacePx} from '../utils/metrics.js'

export const styles: string = css`
  *,
  ::before,
  ::after {
    box-sizing: border-box; /* dimensions include any border and padding. */
    font-family: 'Item Regular';
    font-size: 24px;
    color: ${paletteBlack};

    -webkit-tap-highlight-color: transparent;
    outline: none;
  }

  button {
    /* hack: offset lowercase text. */
    padding: ${quarterSpacePx}px ${spacePx * 2}px ${halfSpacePx}px ${spacePx * 2}px;

    /* background-color: ${paletteWhite}; */
    /* border-radius: ${spacePx}px; */
    /* border: ${halfSpacePx}px solid ${paletteBlack}; */
  }

  /* to-do: proper buttonlib + .com */
  button {
    white-space: nowrap;
    font-weight: 800;
    font-size: 56px;
    background-color: #ffffcd;
    border-radius: 16px;
    outline: none;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
    border: 8px solid #2c2c2c;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  }

  button:hover {
    background-color: #fffde0;
    border-color: #d68b00;
  }

  button:focus {
    background-color: #ffffe6;
    box-shadow: 0px 0px 6px 3px rgba(44, 44, 44, 0.3);
    border-color: #757575;
  }

  button:active {
    background-color: #fffacd;
    border-color: ${paletteWhite};
    box-shadow: inset 0px 1px 4px rgba(0, 0, 0, 0.2);
  }

  button:disabled {
    background-color: #f2f2e6;
    color: #999999;
    border-color: #cccccc;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.5;
  }

  img {
    -webkit-user-drag: none;
    user-drag: none;
  }
`

// hack: enable syntax highlighting. I couldn't get `/*css*/` to work.
export function css(strs: TemplateStringsArray, ...vals: unknown[]): string {
  return strs.reduce((sum, str, i) => `${sum}${str}${vals[i] ?? ''}`, '')
}
