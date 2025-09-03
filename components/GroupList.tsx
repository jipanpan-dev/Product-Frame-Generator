
import React, { useState } from 'react';
import { Group } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon } from './icons';

interface GroupListProps {
  groups: Group[];
  onAddGroup: (name: string) => void;
  onSelectGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onAddGroup, onSelectGroup, onDeleteGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName('');
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    onDeleteGroup(groupId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-200">My Groups</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
        >
          <PlusIcon />
          New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-800 rounded-lg border border-dashed border-slate-700">
          <h3 className="text-xl font-semibold text-slate-300">No Groups Found</h3>
          <p className="text-slate-400 mt-2">Get started by creating your first product group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className="bg-slate-800 rounded-lg p-6 cursor-pointer hover:bg-slate-700/50 hover:shadow-2xl hover:shadow-sky-900/50 border border-slate-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-sky-400 truncate">{group.name}</h3>
                  <p className="text-slate-400 mt-1">{group.products.length} product{group.products.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, group.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-700 transition-colors"
                  aria-label={`Delete ${group.name}`}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Group">
        <div className="space-y-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter group name"
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoFocus
          />
          <button
            onClick={handleAddGroup}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            disabled={!newGroupName.trim()}
          >
            Create Group
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GroupList;
