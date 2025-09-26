import { useState } from 'react';
import { 
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  actionLabel?: string;
  completed?: boolean;
}

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const InteractiveTutorial = ({ isOpen, onClose, onComplete }: InteractiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Stroke Rate',
      content: 'This tutorial will guide you through setting up and using the Stroke Rate heart rate monitoring app. Let\'s get started!',
      action: 'next',
      actionLabel: 'Start Tutorial'
    },
    {
      id: 'check-compatibility',
      title: 'Check Browser Compatibility',
      content: 'First, let\'s make sure your browser supports all the features needed for heart rate monitoring. Click the "Compatibility" button in the navigation to run a compatibility test.',
      target: 'compatibility-button',
      position: 'bottom',
      action: 'check-compatibility',
      actionLabel: 'Check Compatibility'
    },
    {
      id: 'add-rowers',
      title: 'Add Your Rowers',
      content: 'Now let\'s add your rowers to the system. Click "Setup" in the navigation to add rowers with their names and seat numbers.',
      target: 'setup-button',
      position: 'bottom',
      action: 'navigate-setup',
      actionLabel: 'Go to Setup'
    },
    {
      id: 'connect-devices',
      title: 'Connect Heart Rate Monitors',
      content: 'In the Setup page, click "Scan for Devices" to find your heart rate monitors. Then connect and assign them to your rowers.',
      action: 'next',
      actionLabel: 'Got It'
    },
    {
      id: 'start-session',
      title: 'Start a Training Session',
      content: 'Once your devices are connected, go back to the Dashboard and click "Start Session" to begin monitoring heart rate data.',
      target: 'start-session-button',
      position: 'top',
      action: 'start-session',
      actionLabel: 'Start Session'
    },
    {
      id: 'monitor-data',
      title: 'Monitor Heart Rate Data',
      content: 'Watch real-time heart rate data from all connected rowers. You can see current heart rate, zones, and connection status.',
      action: 'next',
      actionLabel: 'Continue'
    },
    {
      id: 'end-session',
      title: 'End the Session',
      content: 'When your training is complete, click "End Session" to stop monitoring and save the session data.',
      target: 'end-session-button',
      position: 'top',
      action: 'end-session',
      actionLabel: 'End Session'
    },
    {
      id: 'view-progress',
      title: 'View Progress and Analytics',
      content: 'After ending a session, you can view detailed analytics and progress tracking in the Progress page.',
      action: 'next',
      actionLabel: 'View Progress'
    },
    {
      id: 'export-data',
      title: 'Export Your Data',
      content: 'You can export session data in CSV or JSON format from the Export page for further analysis or sharing.',
      action: 'next',
      actionLabel: 'Export Data'
    },
    {
      id: 'tutorial-complete',
      title: 'Tutorial Complete!',
      content: 'Congratulations! You\'ve learned the basics of using Stroke Rate. You can always access help and documentation using the help button in the header.',
      action: 'complete',
      actionLabel: 'Finish Tutorial'
    }
  ];

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'next':
        handleNext();
        break;
      case 'check-compatibility':
        // Navigate to compatibility test
        window.location.hash = '#/compatibility';
        handleNext();
        break;
      case 'navigate-setup':
        // Navigate to setup
        window.location.hash = '#/setup';
        handleNext();
        break;
      case 'start-session':
        // This would be handled by the actual start session button
        handleNext();
        break;
      case 'end-session':
        // This would be handled by the actual end session button
        handleNext();
        break;
      case 'complete':
        handleComplete();
        break;
      default:
        handleNext();
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!isOpen) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial">
        <div className="tutorial-header">
          <div className="tutorial-progress">
            <div className="tutorial-progress-bar">
              <div 
                className="tutorial-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="tutorial-progress-text">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>
          
          <div className="tutorial-controls">
            <button
              onClick={handlePlayPause}
              className="tutorial-control-button"
              aria-label={isPlaying ? 'Pause tutorial' : 'Play tutorial'}
            >
              {isPlaying ? (
                <PauseIcon className="tutorial-control-icon" />
              ) : (
                <PlayIcon className="tutorial-control-icon" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="tutorial-close-button"
              aria-label="Close tutorial"
            >
              <XMarkIcon className="tutorial-close-icon" />
            </button>
          </div>
        </div>

        <div className="tutorial-content">
          <div className="tutorial-step">
            <h3 className="tutorial-step-title">
              {currentStepData.title}
            </h3>
            
            <p className="tutorial-step-content">
              {currentStepData.content}
            </p>

            {currentStepData.target && (
              <div className="tutorial-target">
                <InformationCircleIcon className="tutorial-target-icon" />
                <span>Look for the highlighted element on the page</span>
              </div>
            )}
          </div>

          <div className="tutorial-actions">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="tutorial-action-button tutorial-action-button--secondary"
            >
              <ArrowLeftIcon className="tutorial-action-icon" />
              Previous
            </button>

            <button
              onClick={() => handleAction(currentStepData.action || 'next')}
              className="tutorial-action-button tutorial-action-button--primary"
            >
              {currentStepData.actionLabel || 'Next'}
              <ArrowRightIcon className="tutorial-action-icon" />
            </button>
          </div>
        </div>

        <div className="tutorial-steps">
          <h4 className="tutorial-steps-title">Tutorial Steps</h4>
          <div className="tutorial-steps-list">
            {tutorialSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`tutorial-step-button ${
                  index === currentStep ? 'tutorial-step-button--active' : ''
                } ${
                  completedSteps.has(index) ? 'tutorial-step-button--completed' : ''
                }`}
              >
                <div className="tutorial-step-button-content">
                  <div className="tutorial-step-button-number">
                    {completedSteps.has(index) ? (
                      <CheckCircleIcon className="tutorial-step-button-check" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="tutorial-step-button-title">
                    {step.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
