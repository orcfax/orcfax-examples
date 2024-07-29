import { lucid } from "../../deps.ts";

const ba = String.prototype;

export function valiPref(): string {
  return "000de140";
}

export function authPref(): string {
  return "000643b0";
}

export function fspLabel(): string {
  return "";
}

export function fspVali() {
  return ba.concat(valiPref(), fspLabel());
}

export function fspAuth() {
  return ba.concat(authPref(), fspLabel());
}

export function fs(): string {
  return "";
}
