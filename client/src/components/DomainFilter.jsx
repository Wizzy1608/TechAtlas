const DOMAINS = [
  { name: 'ethical-hacking', icon: '🎯', label: 'Ethical Hacking' },
  { name: 'linux-unix', icon: '🐧', label: 'Linux / Unix' },
  { name: 'troubleshooting', icon: '🔧', label: 'Troubleshooting / IT' },
  { name: 'networking', icon: '🌐', label: 'Network Engineering' },
  { name: 'devtools', icon: '🛠️', label: 'DevTools' },
  { name: 'sysadmin', icon: '🖥️', label: 'System Administration' },
  { name: 'cybersecurity', icon: '🛡️', label: 'Cybersecurity' },
  { name: 'cloud-computing', icon: '☁️', label: 'Cloud Computing' },
  { name: 'ai-ml', icon: '🤖', label: 'AI / ML' },
];

export default function DomainFilter({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          !selected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        All
      </button>
      {DOMAINS.map(d => (
        <button
          key={d.name}
          onClick={() => onChange(selected === d.name ? null : d.name)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selected === d.name
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {d.icon} {d.label}
        </button>
      ))}
    </div>
  );
}