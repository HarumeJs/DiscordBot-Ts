declare module 'node-canvas-with-twemoji' {
  import { CanvasRenderingContext2D } from 'canvas'

  export interface TextMeasure {
    width: number
  }

  export function measureText(
    ctx: CanvasRenderingContext2D,
    text: string
  ): TextMeasure

  export function fillTextWithTwemoji(
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number,
    maxWidth?: number
  ): Promise<void>

  export function strokeTextWithTwemoji(
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number,
    maxWidth?: number
  ): Promise<void>
}
