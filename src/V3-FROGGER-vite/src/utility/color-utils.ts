import { Color } from 'three';

export const getRandomThreeColor = (): Color => {
  const hex = Math.floor(Math.random() * 0xffffff);
  return new Color(hex);
};

export const getRandomCssColor = (): string => {
  const hex = Math.floor(Math.random() * 0xffffff);
  return '#' + hex.toString(16).padStart(6, '0');
};

export const getRandomHexColor = (): number => {
  return Math.floor(Math.random() * 0xffffff);
};
