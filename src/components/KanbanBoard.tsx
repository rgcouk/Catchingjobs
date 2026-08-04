import React, { useState, useEffect, useCallback } from 'react';

export function KanbanBoard({ applications, onUpdateStatus, onSelectApp }: any) {
  const columns = ['NEW', 'REVIEWING', 'HIRED', 'REJECTED'];

  return (
    <div className="flex flex-1 h-full gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div
          key={col}
          className="w-80 shrink-0 flex flex-col bg-muted/30 rounded-lg border border-border"
        >
          <div className="p-3 border-b border-border flex justify-between items-center bg-card rounded-t-lg">
            <h3 className="font-semibold text-sm">{col}</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {applications.filter((a: any) => (a.status || 'NEW') === col).length}
            </span>
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {applications
              .filter((a: any) => (a.status || 'NEW') === col)
              .map((app: any) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  className="bg-card p-3 rounded border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="font-medium text-sm">{app.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {app.sector} - {app.town}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <select
                      className="text-[10px] p-1 border rounded"
                      value={app.status || 'NEW'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                    >
                      <option value="NEW">NEW</option>
                      <option value="REVIEWING">REVIEWING</option>
                      <option value="HIRED">HIRED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
