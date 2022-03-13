import { HCT } from "@material/material-color-utilities";

export function getRandomNiceColor(): string {
    return getNiceColor(Math.floor(Math.random() * 360));
}

export function getNiceColor(hue: number): string {
    const color = HCT.from(hue, 45, 80);
    return numberToHex(color.toInt());
}

export function numberToHex(n: number): string {
    return `#${n.toString(16).substring(2)}`;
}

export function hexToNumber(hex: string): number {
    return Number.parseInt(hex.substring(1), 16);
}
