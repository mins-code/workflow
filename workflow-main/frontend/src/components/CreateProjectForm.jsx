import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../lib/ui/Button';
import Card from '../lib/ui/Card';

export default function CreateProjectForm({ onCreate }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title && goal && deadline) {
      setIsSubmitting(true);
      try {
        await onCreate?.({ title, goal, deadline });
      } catch (error) {
        console.error('Failed to create project:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="app-label">Project Title</label>
          <input
            className="app-input mt-2"
            placeholder="E.g. Marketing site revamp"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <p className="text-xs text-dark-muted mt-2">
            Give your project a clear, descriptive name
          </p>
        </div>

        <div>
          <label className="app-label">Goal</label>
          <textarea
            className="app-textarea mt-2 h-32"
            placeholder="Describe the project objectives and expected outcomes..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
          <p className="text-xs text-dark-muted mt-2">
            What do you want to achieve with this project?
          </p>
        </div>

        <div>
          <label className="app-label">Deadline</label>
          <input
            type="date"
            className="app-input mt-2"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
          <p className="text-xs text-dark-muted mt-2">
            When should this project be completed?
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate('/projects')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Card>
  );
}