import { FilesExplorer } from './FilesExplorer';

/**
 * Media explorer - wrapper around FilesExplorer that opens on the media folder
 * with a custom title and the ability to add media files to scenarios.
 */
export function MediaExplorer() {
  return <FilesExplorer initialPath="media" title="Media" />;
}




