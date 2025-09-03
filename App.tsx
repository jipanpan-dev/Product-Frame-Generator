
import React, { useState, useCallback } from 'react';
import { Group } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import GroupList from './components/GroupList';
import GroupDetail from './components/GroupDetail';
import { LogoIcon } from './components/icons';
import ConfirmModal from './components/ConfirmModal';
import { ThemesProvider } from './hooks/useThemes';

const App: React.FC = () => {
  const [groups, setGroups] = useLocalStorage<Group[]>('productGroups', []);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const addGroup = (name: string) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      products: [],
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const requestDeleteGroup = (groupId: string) => {
    setGroupToDelete(groupId);
  };
  
  const confirmDeleteGroup = () => {
      if (!groupToDelete) return;
      setGroups(prev => prev.filter(g => g.id !== groupToDelete));
      if (selectedGroupId === groupToDelete) {
          setSelectedGroupId(null);
      }
      setGroupToDelete(null);
  }

  const updateGroup = useCallback((updatedGroup: Group) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  }, [setGroups]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <ThemesProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700 sticky top-0 z-20">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <LogoIcon />
              <h1 className="text-2xl font-bold text-sky-400">Product Frame Generator</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-8">
          {selectedGroup ? (
            <GroupDetail
              group={selectedGroup}
              onGroupUpdate={updateGroup}
              onDeleteGroup={() => requestDeleteGroup(selectedGroup.id)}
              onBack={() => setSelectedGroupId(null)}
            />
          ) : (
            <GroupList
              groups={groups}
              onAddGroup={addGroup}
              onSelectGroup={setSelectedGroupId}
              onDeleteGroup={requestDeleteGroup}
            />
          )}
        </main>

        <ConfirmModal
          isOpen={!!groupToDelete}
          onClose={() => setGroupToDelete(null)}
          onConfirm={confirmDeleteGroup}
          title="Delete Group"
          message="Are you sure you want to delete this group and all its products? This action cannot be undone."
        />

        <footer className="text-center p-4 mt-8 text-slate-500 border-t border-slate-800">
          <p>&copy; {new Date().getFullYear()} Product Frame Generator. All rights reserved.</p>
        </footer>
      </div>
    </ThemesProvider>
  );
};

export default App;
