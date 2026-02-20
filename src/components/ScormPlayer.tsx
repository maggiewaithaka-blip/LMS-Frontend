import React from 'react';

export type ScormPackage = {
  id: number;
  name: string;
  launch_url: string;
};

interface ScormPlayerProps {
  scormPackages: ScormPackage[];
}

const ScormPlayer: React.FC<ScormPlayerProps> = ({ scormPackages }) => {
  const [selected, setSelected] = React.useState<ScormPackage | null>(scormPackages[0] || null);

  if (!scormPackages || scormPackages.length === 0) {
    // Do not render anything if no SCORM packages
    return null;
  }
  return (
    <div className="my-8">
      <ul className="mb-4 flex flex-wrap gap-2">
        {scormPackages.map((pkg) => (
          <li key={pkg.id}>
            <button
              className={`px-4 py-2 rounded border ${selected?.id === pkg.id ? "bg-indigo-500 text-white" : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"}`}
              onClick={() => setSelected(pkg)}
            >
              {pkg.name}
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <iframe
          src={`https://lms.careerguidancecollege.com${selected.launch_url}`}
          width="100%"
          height={600}
          frameBorder={0}
          title="SCORM Player"
          className="rounded shadow border w-full"
        />
      )}
    </div>
  );
};

export default ScormPlayer;
