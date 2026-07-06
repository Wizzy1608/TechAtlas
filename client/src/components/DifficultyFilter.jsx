const filters = [
  { key: '', label: 'All', color: '' },
  { key: 'beginner', label: '🟢 Beginner', color: 'bg-green-100 text-green-800' },
  { key: 'intermediate', label: '🟡 Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'advanced', label: '🔴 Advanced', color: 'bg-red-100 text-red-800' },
];

function DifficultyFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1.5 text-sm rounded-full border font-medium transition-colors ${
            selected === f.key
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export default DifficultyFilter;