import { useMemo } from 'react';
import { Folder, ChevronRight, ChevronDown, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FolderTreeNode } from '@/types/files';

interface FileTreeProps {
  folders: FolderTreeNode[];
  currentPath: string;
  onSelectFolder: (path: string) => void;
  expandedFolders: Set<string>;
  onToggleExpand: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
}

/** Buduje drzewo z płaskiej listy folderów */
function buildTree(folders: FolderTreeNode[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  // Sortuj po głębokości (liczbie /)
  const sorted = [...folders].sort(
    (a, b) => a.path.split('/').length - b.path.split('/').length
  );

  for (const folder of sorted) {
    const node: TreeNode = {
      name: folder.name,
      path: folder.path,
      children: [],
    };
    nodeMap.set(folder.path, node);

    const parentPath = folder.path.includes('/')
      ? folder.path.substring(0, folder.path.lastIndexOf('/'))
      : '';

    if (parentPath === '') {
      root.push(node);
    } else {
      const parent = nodeMap.get(parentPath);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  return root;
}

function TreeItem({
  node,
  level,
  currentPath,
  onSelectFolder,
  expandedFolders,
  onToggleExpand,
}: {
  node: TreeNode;
  level: number;
  currentPath: string;
  onSelectFolder: (path: string) => void;
  expandedFolders: Set<string>;
  onToggleExpand: (path: string) => void;
}) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = currentPath === node.path;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => onSelectFolder(node.path)}
        className={cn(
          'flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors min-w-0',
          isSelected && 'bg-muted text-foreground font-medium'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.path);
            }}
            className="p-0.5 hover:bg-accent rounded shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Folder className="h-4 w-4 text-blue-400 shrink-0" />
        <span className="truncate min-w-0">{node.name}</span>
      </button>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              currentPath={currentPath}
              onSelectFolder={onSelectFolder}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  folders,
  currentPath,
  onSelectFolder,
  expandedFolders,
  onToggleExpand,
}: FileTreeProps) {
  const tree = useMemo(() => buildTree(folders), [folders]);

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {/* Root */}
        <button
          onClick={() => onSelectFolder('')}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors min-w-0',
            currentPath === '' && 'bg-muted text-foreground font-medium'
          )}
        >
          <HardDrive className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate">data</span>
        </button>

        {/* Tree */}
        <div className="mt-1">
          {tree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              level={1}
              currentPath={currentPath}
              onSelectFolder={onSelectFolder}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

