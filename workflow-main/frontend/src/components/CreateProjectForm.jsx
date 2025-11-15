// frontend/src/components/CreateProjectForm.jsx
import React, { useState } from 'react';
import Button from '../lib/ui/Button';
import Card from '../lib/ui/Card';

export default function CreateProjectForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && goal && deadline) {
      onCreate?.({ title, goal, deadline });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Project title</label>
          <input
            className="mb-input mt-2"
            placeholder="E.g. Marketing site revamp"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Goal</label>
          <textarea
            className="mb-input mt-2 h-28"
            placeholder="Short description"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Deadline</label>
          <input
            type="date"
            className="mb-input mt-2"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => { setTitle(''); setGoal(''); setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) }}>Reset</Button>
          <Button type="submit">Create project</Button>
        </div>
      </form>
    </Card>
  );
}