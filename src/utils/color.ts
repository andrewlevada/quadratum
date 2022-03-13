import { HCT } from "@material/material-color-utilities";

export function getRandomNiceColor(): string {
    return getNiceColor(Math.floor(Math.random() * 360));
}

export function getNiceColor(hue: number): string {
    const color = HCT.from(hue, 45, 80);
    const hex = color.toInt().toString(16).substring(2);
    return `#${hex}`;
}
