import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MapPin,
  ShieldCheck,
  Clock,
  Car,
  ChevronRight,
  GripVertical,
  Calendar,
  Smartphone,
  Mail,
  ArrowRight,
  Sparkles,
  UserCheck,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  description?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  statusId: string;

  // Rich applicant metadata
  name?: string;
  email?: string;
  phone?: string;
  sector?: string;
  town?: string;
  rosterRef?: string;
  hasRightToWork?: boolean | string | null;
  hasDrivingLicense?: boolean | string | null;
  profileFormCompleted?: boolean;
  contacted?: boolean;
  safetyResourcesSent?: boolean;
  safetyTasksCompleted?: boolean;
  rawApplication?: any;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  onTaskStatusChange: (taskId: string, newStatusId: string) => void;
  onTaskSelect?: (task: KanbanTask) => void;
}

const COLUMN_THEMES: Record<
  string,
  {
    headerBg: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  NEW: {
    headerBg: 'bg-blue-50/50 dark:bg-blue-950/20',
    borderAccent: 'border-t-blue-500',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  REVIEWING: {
    headerBg: 'bg-amber-50/50 dark:bg-amber-950/20',
    borderAccent: 'border-t-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  HIRED: {
    headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    borderAccent: 'border-t-emerald-500',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  REJECTED: {
    headerBg: 'bg-rose-50/50 dark:bg-rose-950/20',
    borderAccent: 'border-t-rose-500',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
    badgeText: 'text-rose-700 dark:text-rose-300',
    dotColor: 'bg-rose-500',
  },
};

export function KanbanBoard({
  columns,
  tasks,
  onTaskStatusChange,
  onTaskSelect,
}: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onTaskStatusChange(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const getNextStatus = (current: string) => {
    if (current === 'NEW') return 'REVIEWING';
    if (current === 'REVIEWING') return 'HIRED';
    return null;
  };

  return (
    <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
      <div className="flex gap-4 min-w-[1100px] xl:min-w-full items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.statusId === col.id);
          const theme = COLUMN_THEMES[col.id] || {
            headerBg: 'bg-muted/40',
            borderAccent: 'border-t-primary',
            badgeBg: 'bg-muted',
            badgeText: 'text-muted-foreground',
            dotColor: 'bg-primary',
          };
          const isDragOver = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumnId(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-1 min-w-[270px] max-w-[340px] flex flex-col rounded-xl border bg-muted/20 transition-all duration-200 ${
                theme.borderAccent
              } border-t-4 ${
                isDragOver
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
                  : 'border-border'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b border-border/80 rounded-t-lg flex items-center justify-between ${theme.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                  <span className="font-semibold text-xs tracking-wider uppercase text-foreground">
                    {col.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Column Body */}
              <div className="p-3 flex-1 flex flex-col gap-3 min-h-[420px] max-h-[calc(100vh-280px)] overflow-y-auto">
                {colTasks.map((task) => {
                  const isBeingDragged = draggedTaskId === task.id;
                  const candidateName = task.name || task.title || 'Applicant';
                  const candidateInitial = candidateName.charAt(0).toUpperCase();
                  const nextStatus = getNextStatus(task.statusId);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskSelect?.(task)}
                      className={`group bg-card rounded-lg border border-border p-3.5 shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing select-none relative ${
                        isBeingDragged ? 'opacity-40 scale-95 border-dashed border-primary' : ''
                      }`}
                    >
                      {/* Top Row: Avatar, Name, Sector */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              task.sector === 'chicken'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {candidateInitial}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                              {candidateName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="outline"
                                className="text-[9px] uppercase px-1.5 py-0 font-mono tracking-wider"
                              >
                                {task.sector || 'General'}
                              </Badge>
                              {task.rosterRef && (
                                <span className="text-[10px] font-mono text-muted-foreground truncate">
                                  {task.rosterRef}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 cursor-grab" />
                      </div>

                      {/* Middle: Location & Contact */}
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        {task.town && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                            <span className="truncate">{task.town}</span>
                          </div>
                        )}
                        {(task.email || task.phone) && (
                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            {task.phone && <span className="truncate">{task.phone}</span>}
                          </div>
                        )}
                      </div>

                      {/* Compliance Checklist Chips */}
                      <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap items-center gap-1.5">
                        {task.hasRightToWork ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 font-mono flex items-center gap-1"
                          >
                            <ShieldCheck className="w-2.5 h-2.5" /> RTW
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 px-1.5 text-muted-foreground font-mono"
                          >
                            RTW Pending
                          </Badge>
                        )}

                        {task.profileFormCompleted ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800 font-mono flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" /> Induction
                          </Badge>
                        ) : null}

                        {task.hasDrivingLicense ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 px-1.5 text-muted-foreground font-mono flex items-center gap-1"
                          >
                            <Car className="w-2.5 h-2.5" /> Driver
                          </Badge>
                        ) : null}
                      </div>

                      {/* Bottom Footer: Date & Quick Actions */}
                      <div className="mt-3 pt-2.5 border-t border-border/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground/60" />
                          {task.date}
                        </span>

                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Stage Selector Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] font-mono px-2 py-0"
                              >
                                <span>Move</span>
                                <ChevronRight className="w-3 h-3 ml-0.5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              {columns.map((c) => (
                                <DropdownMenuItem
                                  key={c.id}
                                  onClick={() => onTaskStatusChange(task.id, c.id)}
                                  className={task.statusId === c.id ? 'font-bold text-primary' : ''}
                                >
                                  {c.title}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Quick Advance Button if available */}
                          {nextStatus && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                              title={`Advance to ${nextStatus}`}
                              onClick={() => onTaskStatusChange(task.id, nextStatus)}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State Drop Target */}
                {colTasks.length === 0 && (
                  <div
                    className={`h-36 rounded-lg border border-dashed flex flex-col items-center justify-center p-4 text-center transition-colors ${
                      isDragOver
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground/60'
                    }`}
                  >
                    <p className="text-xs font-mono">No candidates in stage</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">
                      Drag candidate cards here
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
