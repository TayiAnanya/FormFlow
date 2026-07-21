import { FormSchema } from '../../models/form-schema.model';

/**
 * FF-005 seam: the Dynamic Form Renderer will accept a loaded FormSchema as its sole input.
 * Schema loading (FF-003) supplies this contract; the renderer remains demo-agnostic.
 */
export type RendererInput = FormSchema;
