import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  statusId: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  onTaskStatusChange: (taskId: string, newStatusId: string) => void;
  onTaskSelect?: (task: KanbanTask) => void;
}

export function KanbanBoard({
  columns,
  tasks,
  onTaskStatusChange,
  onTaskSelect,
}: KanbanBoardProps) {
  return (
    <div className="flex flex-1 h-full gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <Card
          key={col.id}
          className="w-80 shrink-0 flex flex-col bg-muted/30 border-border shadow-none"
        >
          <CardHeader className="p-3 border-b border-border bg-card rounded-t-lg flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-semibold text-sm">{col.title}</CardTitle>
            <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs font-normal">
              {tasks.filter((t) => t.statusId === col.id).length}
            </Badge>
          </CardHeader>
          <CardContent className="p-3 flex-1 overflow-y-auto space-y-3">
            {tasks
              .filter((t) => t.statusId === col.id)
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskSelect?.(task)}
                  className="bg-card p-3 rounded border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{task.subtitle}</div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{task.date}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={task.statusId}
                        onValueChange={(val) => onTaskStatusChange(task.id, val)}
                      >
                        <SelectTrigger className="h-6 text-[10px] w-[100px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="text-[10px]">
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
