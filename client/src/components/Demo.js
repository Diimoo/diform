import React, { useState, useEffect } from 'react';
import { FiX, FiSend, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import integrationService from '../services/integrationService';
import './Demo.css';

function Demo({ isOpen, onClose }) {
  const [command, setCommand] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [realData, setRealData] = useState(null);

  useEffect(() => {
    // Check if running in Electron and get user
    const checkAuth = async () => {
      const electron = integrationService.isElectronApp();
      setIsElectron(electron);
      if (electron) {
        const user = await integrationService.getUser();
        setIsAuthenticated(!!user);
      }
    };
    checkAuth();
  }, []);

  const exampleCommands = [
    "Summarize the last 48h customer emails for Project X, draft responses, schedule 2 meetings next week, and update the steering deck.",
    "Create a QBR presentation from this Excel data with risks, opportunities and 3 recommendations - max 10 slides.",
    "Prepare onboarding checklist, assign tasks in Planner, and invite everyone to the kick-off meeting.",
    "Explain the Q3 variances, create pivot table, generate chart, and provide recommendations."
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    setProcessing(true);
    setResult(null);

    try {
      const response = await axios.post('/api/process', {
        command,
        context: { demo: true }
      });

      setResult(response.data.task);
    } catch (error) {
      console.error('Error processing command:', error);
      setResult({
        error: true,
        message: 'Failed to process command. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleExampleClick = (example) => {
    setCommand(example);
    setResult(null);
  };

  const handleClose = () => {
    setCommand('');
    setResult(null);
    setProcessing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="demo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="demo-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="demo-header">
              <h2 className="demo-title">Interactive DIForM Demo</h2>
              <button className="demo-close" onClick={handleClose}>
                <FiX />
              </button>
            </div>

            <div className="demo-body">
              <div className="demo-examples">
                <p className="examples-label">Try these examples:</p>
                <div className="examples-grid">
                  {exampleCommands.map((example, index) => (
                    <button
                      key={index}
                      className="example-btn"
                      onClick={() => handleExampleClick(example)}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <form className="demo-form" onSubmit={handleSubmit}>
                <div className="input-wrapper">
                  <textarea
                    className="demo-input"
                    placeholder="Describe what you want DIForM to do..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    rows={3}
                    disabled={processing}
                  />
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!command.trim() || processing}
                  >
                    <FiSend />
                  </button>
                </div>
              </form>

              {processing && (
                <motion.div
                  className="processing-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="processing-spinner"></div>
                  <p className="processing-text">DIForM is processing your request...</p>
                </motion.div>
              )}

              {result && !result.error && (
                <motion.div
                  className="result-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="result-header">
                    <FiCheck className="result-icon success" />
                    <h3 className="result-title">Task Completed Successfully</h3>
                  </div>

                  <div className="result-steps">
                    {result.steps.map((step, index) => (
                      <motion.div
                        key={index}
                        className="result-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`step-phase phase-${step.phase}`}>
                          {step.phase}
                        </div>
                        <div className="step-info">
                          <h4 className="step-title-result">{step.title}</h4>
                          <p className="step-desc">{step.description}</p>
                          {step.actions && (
                            <ul className="step-actions">
                              {step.actions.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="result-footer">
                    <FiClock className="footer-icon" />
                    <span>Completed in {((result.steps.length * 0.6)).toFixed(1)}s</span>
                  </div>
                </motion.div>
              )}

              {result && result.error && (
                <motion.div
                  className="result-container error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="error-message">{result.message}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Demo;
