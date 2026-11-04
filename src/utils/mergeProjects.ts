import { Project } from '../types';
import { projectsData } from '../data/projects';

/** Use saved projects as-is so admin deletes stick; only seed defaults when empty. */
export function mergeProjectsWithDefaults(loaded: Project[] | undefined): Project[] {
  if (!Array.isArray(loaded) || loaded.length === 0) return projectsData;
  return loaded;
}
