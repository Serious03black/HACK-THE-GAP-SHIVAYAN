import React from 'react';

const FaceVerification = ({ studentData, capturedFaceUrl }) => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Face Verification</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-700 mb-2">Registered Photo</p>
        {studentData?.studentPhoto?.secure_url ? (
          <img
            src={studentData.studentPhoto.secure_url}
            alt="Registered face"
            className="w-full h-48 object-cover rounded border border-gray-200"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-700 mb-2">Captured Photo</p>
        {capturedFaceUrl ? (
          <img
            src={capturedFaceUrl}
            alt="Captured face"
            className="w-full h-48 object-cover rounded border border-gray-200"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Not captured yet</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default FaceVerification;