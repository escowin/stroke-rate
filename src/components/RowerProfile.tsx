import { useState } from 'react';
import type { Rower } from '../types';
import { calculateMaxHeartRate, estimateRestingHeartRate } from '../utils/heartRateCalculations';
import { 
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface RowerProfileProps {
  rower: Rower;
  onUpdate: (rowerId: string, updates: Partial<Rower>) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

export const RowerProfile = ({ 
  rower, 
  onUpdate, 
  isEditing = false, 
  onEditToggle 
}: RowerProfileProps) => {
  const [formData, setFormData] = useState({
    name: rower.name,
    age: rower.age || '',
    restingHeartRate: rower.restingHeartRate || '',
    maxHeartRate: rower.maxHeartRate || '',
    hasCustomRestingHR: !!rower.restingHeartRate,
    hasCustomMaxHR: !!rower.maxHeartRate
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Track when user manually enters custom HR values
      hasCustomRestingHR: field === 'restingHeartRate' ? true : prev.hasCustomRestingHR,
      hasCustomMaxHR: field === 'maxHeartRate' ? true : prev.hasCustomMaxHR
    }));
  };

  const handleAgeChange = (age: string) => {
    const ageNum = parseInt(age) || 0;
    setFormData(prev => ({
      ...prev,
      age: age,
      // Auto-calculate HR values when age changes, but preserve custom values if user has set them
      restingHeartRate: prev.hasCustomRestingHR ? prev.restingHeartRate : estimateRestingHeartRate(ageNum).toString(),
      maxHeartRate: prev.hasCustomMaxHR ? prev.maxHeartRate : calculateMaxHeartRate(ageNum).toString()
    }));
  };

  const handleSave = () => {
    const updates: Partial<Rower> = {
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      restingHeartRate: formData.restingHeartRate ? parseInt(formData.restingHeartRate) : undefined,
      maxHeartRate: formData.maxHeartRate ? parseInt(formData.maxHeartRate) : undefined
    };
    
    onUpdate(rower.id, updates);
    onEditToggle?.();
  };

  const handleCancel = () => {
    setFormData({
      name: rower.name,
      age: rower.age || '',
      restingHeartRate: rower.restingHeartRate || '',
      maxHeartRate: rower.maxHeartRate || '',
      hasCustomRestingHR: !!rower.restingHeartRate,
      hasCustomMaxHR: !!rower.maxHeartRate
    });
    onEditToggle?.();
  };

  const estimatedMaxHR = rower.age ? calculateMaxHeartRate(rower.age) : null;
  const estimatedRestingHR = rower.age ? estimateRestingHeartRate(rower.age) : null;

  return (
    <div className="rower-profile">
      <div className="rower-profile-header">
        <div className="rower-profile-info">
          <UserIcon className="rower-profile-icon" />
          <div>
            <h3 className="rower-profile-name">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="rower-profile-input"
                  placeholder="Rower name"
                />
              ) : (
                rower.name
              )}
            </h3>
            <p className="rower-profile-seat">Seat {rower.seat}</p>
          </div>
        </div>
        
        <div className="rower-profile-actions">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="btn btn-sm btn-primary"
                title="Save changes"
              >
                <CheckIcon className="btn-icon" />
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-sm btn-secondary"
                title="Cancel"
              >
                <XMarkIcon className="btn-icon" />
              </button>
            </>
          ) : (
            <button
              onClick={onEditToggle}
              className="btn btn-sm btn-secondary"
              title="Edit profile"
            >
              <PencilIcon className="btn-icon" />
            </button>
          )}
        </div>
      </div>

      <div className="rower-profile-details">
        <div className="rower-profile-field">
          <label className="rower-profile-label">Age</label>
          {isEditing ? (
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleAgeChange(e.target.value)}
              className="rower-profile-input"
              placeholder="Enter age"
              min="14"
              max="80"
            />
          ) : (
            <span className="rower-profile-value">
              {rower.age ? `${rower.age} years` : 'Not set'}
            </span>
          )}
        </div>

        <div className="rower-profile-field">
          <label className="rower-profile-label">Resting HR</label>
          {isEditing ? (
            <div className="rower-profile-input-group">
              <input
                type="number"
                value={formData.restingHeartRate}
                onChange={(e) => handleInputChange('restingHeartRate', e.target.value)}
                className="rower-profile-input"
                placeholder="BPM"
                min="30"
                max="100"
              />
              {estimatedRestingHR && (
                <div className="rower-profile-estimate-group">
                  <span className="rower-profile-estimate">
                    Est: {estimatedRestingHR} BPM
                  </span>
                  {formData.hasCustomRestingHR && (
                    <button
                      type="button"
                      onClick={() => {
                        const ageNum = parseInt(formData.age) || 0;
                        setFormData(prev => ({
                          ...prev,
                          restingHeartRate: estimateRestingHeartRate(ageNum).toString(),
                          hasCustomRestingHR: false
                        }));
                      }}
                      className="rower-profile-use-estimate-btn"
                    >
                      Use Estimate
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="rower-profile-value">
              {rower.restingHeartRate ? `${rower.restingHeartRate} BPM` : 
               estimatedRestingHR ? `Est: ${estimatedRestingHR} BPM` : 'Not set'}
            </span>
          )}
        </div>

        <div className="rower-profile-field">
          <label className="rower-profile-label">Max HR</label>
          {isEditing ? (
            <div className="rower-profile-input-group">
              <input
                type="number"
                value={formData.maxHeartRate}
                onChange={(e) => handleInputChange('maxHeartRate', e.target.value)}
                className="rower-profile-input"
                placeholder="BPM"
                min="150"
                max="220"
              />
              {estimatedMaxHR && (
                <div className="rower-profile-estimate-group">
                  <span className="rower-profile-estimate">
                    Est: {estimatedMaxHR} BPM
                  </span>
                  {formData.hasCustomMaxHR && (
                    <button
                      type="button"
                      onClick={() => {
                        const ageNum = parseInt(formData.age) || 0;
                        setFormData(prev => ({
                          ...prev,
                          maxHeartRate: calculateMaxHeartRate(ageNum).toString(),
                          hasCustomMaxHR: false
                        }));
                      }}
                      className="rower-profile-use-estimate-btn"
                    >
                      Use Estimate
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="rower-profile-value">
              {rower.maxHeartRate ? `${rower.maxHeartRate} BPM` : 
               estimatedMaxHR ? `Est: ${estimatedMaxHR} BPM` : 'Not set'}
            </span>
          )}
        </div>
      </div>

      {rower.age && (
        <div className="rower-profile-note">
          <p className="text-sm text-gray-600">
            Heart rate zones calculated using athletic training formulas optimized for rowers.
            Supports High School (14-18), Collegiate (18-22), and Masters (23-80+) rowing.
          </p>
        </div>
      )}
    </div>
  );
};
