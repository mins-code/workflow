// frontend/src/components/CreateProjectForm.jsx
import React, { useState } from 'react';
import Button from '../lib/ui/Button';
import Card from '../lib/ui/Card';

export default function CreateProjectForm({ onCreate }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!name) return;
    onCreate?.({ name, description: desc });
    setName(''); setDesc('');
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Project name</label>
          <input
            className="mb-input mt-2"
            placeholder="E.g. Marketing site revamp"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="mb-input mt-2 h-28"
            placeholder="Short description"
            value={desc}
            onChange={(e)=>setDesc(e.target.value)}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={()=>{setName(''); setDesc('')}}>Reset</Button>
          <Button type="submit">Create project</Button>
        </div>
      </form>
    </Card>
  );
}