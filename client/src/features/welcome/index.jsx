import { registerFeature } from '../../feature-registry';

function WelcomePage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-700">Welcome to TechAtlas</h2>
      <p className="text-gray-500 mt-2">Your open-source learning resource hub.</p>
    </div>
  );
}

function WelcomeCard({ title, description }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <h3 className="font-medium text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

registerFeature('welcome', '🏠', WelcomePage, WelcomeCard);

export { WelcomePage, WelcomeCard };