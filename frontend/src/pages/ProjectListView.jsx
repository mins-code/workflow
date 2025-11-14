// frontend/src/pages/ProjectListView.jsx
import React from 'react';
import Card from '../lib/ui/Card';
import { Link } from 'react-router-dom';
import Button from '../lib/ui/Button';

export default function ProjectListView({ projects = [] }) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-h1">Projects</h1>
          <div className="text-sm mb-muted">All projects in your workspace</div>
        </div>
        <div>
          <Link to="/projects/new"><Button>Create project</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <Card key={p.id} className="flex flex-col justify-between">
            <div>
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="text-sm mt-2 mb-muted">{p.description ?? 'No description'}</div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm mb-muted">{p.tasks?.length ?? 0} tasks</div>
              <div className="flex gap-2">
                <Link to={/projects/${p.id}} className="text-sm underline">Open</Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
