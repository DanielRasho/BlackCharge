/* tslint:disable */
/* eslint-disable */
/**
* Calculates the field value at `x`.
* `x` is assumed to be on the axis of symmetry of the cone.
* @param {any} figure
* @param {any} x
* @returns {any}
*/
export function js_cone_field_on(figure: any, x: any): any;
/**
* Calculates the field value at `x`.
* `x` is assumed to be on the axis of symmetry of the cone trunk.
* `parts` Represents the quantity of terms used in the Reinman sum to approximate the field.
* @param {any} figure
* @param {any} x
* @param {any} parts
* @returns {any}
*/
export function js_cone_trunk_field_on(figure: any, x: any, parts: any): any;
/**
* Calculates the field value at `x`.
* `x` is assumed to be on the axis of symmetry of the hemisphere.
* @param {any} figure
* @param {any} x
* @returns {any}
*/
export function js_hemisphere_field_on(figure: any, x: any): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly js_cone_field_on: (a: number, b: number, c: number) => void;
  readonly js_cone_trunk_field_on: (a: number, b: number, c: number, d: number) => void;
  readonly js_hemisphere_field_on: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
