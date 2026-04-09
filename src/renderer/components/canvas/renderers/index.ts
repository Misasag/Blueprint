import { Renderer } from '../utils';
import { layoutRenderers } from './layout';
import { contentRenderers } from './content';
import { inputRenderers } from './input';
import { navigationRenderers } from './navigation';
import { compositeRenderers } from './composite';
import { feedbackRenderers } from './feedback';

export const tagRenderers: Record<string, Renderer> = {
  ...layoutRenderers,
  ...contentRenderers,
  ...inputRenderers,
  ...navigationRenderers,
  ...compositeRenderers,
  ...feedbackRenderers,
};
