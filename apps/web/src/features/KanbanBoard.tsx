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

const COLUMN_THEME = {
  headerBg: 'bg-brand-mist',
  borderAccent: 'border-brand-border',
  badgeBg: 'bg-white',
  badgeText: 'text-brand-obsidian',
  dotColor: 'bg-brand-orange',
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
    <div
      role="region"
      aria-label="Application workflow columns"
      tabIndex={0}
      className="w-full overflow-x-auto pb-6 scrollbar-thin focus-visible:outline-2 focus-visible:outline-brand-orange"
    >
      <div className="flex gap-4 min-w-[1128px] xl:min-w-0 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.statusId === col.id);
          const theme = COLUMN_THEME;
          const isDragOver = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumnId(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-1 min-w-[270px] xl:min-w-0 flex flex-col rounded-sm border bg-brand-mist transition-colors duration-200 ${
                theme.borderAccent
              } ${
                isDragOver
                  ? 'border-primary ring-2 ring-primary/20 bg-brand-ivory'
                  : 'border-border'
              }`}
            >
              {/* Column Header */}
              <div className={`p-4 flex items-center justify-between ${theme.headerBg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                  <span className="font-display font-bold text-lg tracking-tight text-foreground">
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
              <div className="px-4 pb-4 flex-1 flex flex-col gap-4 min-h-[420px] max-h-[calc(100vh-280px)] overflow-y-auto">
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
                      className={`group bg-white rounded-lg border border-brand-border p-5 hover:border-brand-orange transition-colors cursor-grab active:cursor-grabbing select-none relative ${
                        isBeingDragged ? 'opacity-40 scale-95 border-dashed border-primary' : ''
                      }`}
                    >
                      {/* Top Row: Avatar, Name, Sector */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              task.sector === 'chicken'
                                ? 'bg-brand-ivory text-brand-obsidian'
                                : 'bg-white text-brand-obsidian'
                            }`}
                          >
                            {candidateInitial}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-display font-bold text-lg text-foreground leading-tight break-words">
                              <button
                                type="button"
                                className="text-left [overflow-wrap:anywhere] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-orange"
                                onClick={() => onTaskSelect?.(task)}
                              >
                                {candidateName}
                              </button>
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
                                className="min-h-11 text-xs font-mono px-3"
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
                              className="min-h-11 min-w-11 p-0 text-muted-foreground hover:text-primary"
                              title={`Advance to ${nextStatus}`}
                              aria-label={`Advance ${candidateName} to ${nextStatus}`}
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
                    className={`h-36 rounded-md border border-dashed flex flex-col items-center justify-center p-4 text-center transition-colors ${
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
