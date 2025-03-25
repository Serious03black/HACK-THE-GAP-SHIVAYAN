import React from 'react';

const SystemStatus = ({
  cameraStatus,
  micStatus,
  faceMatchStatus,
  cameraCount,
  cameraList,
}) => (
  <div className="w-1/2 bg-white border border-gray-300 rounded shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
        <span className="text-gray-700">Camera:</span>
        <span className={`px-2 py-1 text-sm ${cameraStatus === 'working' ? 'bg-green-200 text-green-800' : cameraStatus === 'blocked' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
          {cameraStatus === 'working' ? 'Operational' : cameraStatus === 'blocked' ? 'Blocked' : 'Checking...'}
        </span>
      </div>
      <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
        <span className="text-gray-700">Microphone:</span>
        <span className={`px-2 py-1 text-sm ${micStatus === 'working' ? 'bg-green-200 text-green-800' : micStatus === 'blocked' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
          {micStatus === 'working' ? 'Operational' : micStatus === 'blocked' ? 'Blocked' : 'Checking...'}
        </span>
      </div>
      <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
        <span className="text-gray-700">Face Verification:</span>
        <span className={`px-2 py-1 text-sm ${faceMatchStatus === 'verified' ? 'bg-green-200 text-green-800' : faceMatchStatus === 'not_matched' ? 'bg-red-200 text-red-800' : faceMatchStatus === 'error' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
          {faceMatchStatus === 'verified' ? 'Verified' : faceMatchStatus === 'not_matched' ? 'Not Matched' : faceMatchStatus === 'error' ? 'Error' : 'Not Checked'}
        </span>
      </div>
      <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
        <span className="text-gray-700">Cameras Detected:</span>
        <span className={`px-2 py-1 text-sm ${cameraCount === 1 ? 'bg-green-200 text-green-800' : cameraCount > 1 ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
          {cameraCount} {cameraCount === 1 ? 'Camera' : 'Cameras'}
        </span>
      </div>
    </div>
    {cameraCount > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Camera Details</h3>
        <div className="bg-gray-50 p-3 border border-gray-200">
          <ul className="space-y-2 text-gray-700">
            {cameraList.map((camera, index) => (
              <li key={camera.deviceId} className="flex items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                {camera.label || `Camera ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}
  </div>
);

export default SystemStatus;