"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Circle,
  CircleCheck,
  LoaderCircle,
  LogOut,
  Plus,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  tasksControllerCreate,
  tasksControllerAssignTaskToUser,
  tasksControllerFindAll,
  tasksControllerFindUsers,
  tasksControllerUpdateStatus,
} from "@/lib/api/generated/sdk.gen";
import type {
  CreateTaskDto,
  TaskStatus,
} from "@/lib/api/generated/types.gen";
import type { UserSession } from "@/lib/auth/session";

type TaskUser = Pick<UserSession, "id" | "username" | "name">;

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  user: TaskUser | null;
};

type TasksDashboardProps = {
  user: UserSession;
  onLogout: () => void;
  loggingOut: boolean;
  logoutError?: string;
};

function getApiError(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.filter(Boolean).join(" ");
  }

  return fallback;
}

async function getUsers(): Promise<TaskUser[]> {
  const result = await tasksControllerFindUsers({ baseUrl: "/api" });
  if (result.error) {
    throw new Error(getApiError(result.error, "No se pudieron cargar los usuarios."));
  }
  return Array.isArray(result.data) ? (result.data as TaskUser[]) : [];
}

async function getTasks(userId: string): Promise<Task[]> {
  const result = await tasksControllerFindAll({
    baseUrl: "/api",
    query: userId === "all" ? {} : { userId: Number(userId) },
  });
  if (result.error) {
    throw new Error(getApiError(result.error, "No se pudieron cargar las tareas."));
  }
  return Array.isArray(result.data) ? (result.data as Task[]) : [];
}

export function TasksDashboard({
  user,
  onLogout,
  loggingOut,
  logoutError,
}: TasksDashboardProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);
  const [notice, setNotice] = useState("");

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  const tasksQuery = useQuery({
    queryKey: ["tasks", selectedUserId],
    queryFn: () => getTasks(selectedUserId),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: TaskStatus }) => {
      const result = await tasksControllerUpdateStatus({
        baseUrl: "/api",
        path: { id },
        body: { status },
      });
      if (result.error) {
        throw new Error(getApiError(result.error, "No se pudo actualizar la tarea."));
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNotice("Estado actualizado.");
    },
  });

  const tasks = tasksQuery.data ?? [];
  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const completeCount = tasks.length - pendingCount;

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-4 py-8 text-[#202723] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#78827b]">Hola, {user.name}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
              Tareas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-10 rounded-xl bg-[#25342d] px-4 text-white hover:bg-[#33463b]"
              onClick={() => {
                setNotice("");
                setCreateDialogOpen(true);
              }}
              type="button"
            >
              <Plus aria-hidden="true" />
              Nueva tarea
            </Button>
            <Button
              aria-label="Cerrar sesión"
              className="size-10 rounded-xl border-[#e4e9e4] bg-white text-[#526057] hover:bg-[#f1f4f1]"
              disabled={loggingOut}
              onClick={onLogout}
              title="Cerrar sesión"
              type="button"
              variant="outline"
            >
              {loggingOut ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <LogOut aria-hidden="true" />
              )}
            </Button>
          </div>
        </header>

        <section className="rounded-2xl border border-[#e9ece8] bg-white p-4 shadow-[0_16px_50px_-38px_rgba(28,43,35,0.3)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-[#eff1ee] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Todas las tareas</h2>
              <p className="mt-1 text-sm text-[#828b84]">
                {pendingCount} pendientes · {completeCount} completadas
              </p>
            </div>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#68746c] sm:min-w-52">
              Filtrar por usuario
              <select
                className="h-10 rounded-xl border border-[#e2e7e2] bg-white px-3 text-sm text-[#344139] outline-none focus:border-[#83958a] focus:ring-4 focus:ring-[#6e8a78]/10"
                onChange={(event) => setSelectedUserId(event.target.value)}
                value={selectedUserId}
              >
                <option value="all">Todos los usuarios</option>
                {(usersQuery.data ?? []).map((taskUser) => (
                  <option key={taskUser.id} value={taskUser.id}>
                    {taskUser.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {notice && (
            <p
              aria-live="polite"
              className="mb-4 rounded-xl border border-[#dce9de] bg-[#f3f8f3] px-3.5 py-2.5 text-sm text-[#466c51]"
              role="status"
            >
              {notice}
            </p>
          )}

          {(usersQuery.isError || tasksQuery.isError || statusMutation.isError || logoutError) && (
            <p
              aria-live="polite"
              className="mb-4 rounded-xl border border-[#f0d8d5] bg-[#fff8f6] px-3.5 py-3 text-sm text-[#9d5046]"
              role="alert"
            >
              {logoutError ??
                (usersQuery.error instanceof Error
                  ? usersQuery.error.message
                  : tasksQuery.error instanceof Error
                    ? tasksQuery.error.message
                    : statusMutation.error instanceof Error
                      ? statusMutation.error.message
                      : "No se pudieron cargar los datos.")}
            </p>
          )}

          {tasksQuery.isPending ? (
            <div className="grid min-h-40 place-items-center text-[#718078]">
              <LoaderCircle aria-label="Cargando tareas" className="size-5 animate-spin" />
            </div>
          ) : tasks.length ? (
            <ul className="divide-y divide-[#eff1ee]">
              {tasks.map((task) => {
                const isComplete = task.status === "complete";
                const isUpdating =
                  statusMutation.isPending &&
                  statusMutation.variables?.id === task.id;

                return (
                  <li
                    className="flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                    key={task.id}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                          isComplete
                            ? "bg-[#e8f2e9] text-[#4f805a]"
                            : "border border-[#d8dfd9] text-transparent"
                        }`}
                      >
                        {isComplete && <Check aria-hidden="true" className="size-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <h3
                          className={`truncate text-sm font-medium ${
                            isComplete ? "text-[#8a938c] line-through" : "text-[#29342d]"
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#7c867f]">
                            {task.description}
                          </p>
                        )}
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#78827b]">
                          <UserRound aria-hidden="true" className="size-3.5" />
                          {task.user?.name ?? "Sin usuario asignado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pl-8 sm:justify-end sm:pl-0">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          isComplete
                            ? "bg-[#eef4ee] text-[#55765b]"
                            : "bg-[#f4f1e9] text-[#8a7441]"
                        }`}
                      >
                        {isComplete ? "Completada" : "Pendiente"}
                      </span>
                      <Button
                        className="h-8 rounded-lg px-2.5 text-xs text-[#59685e] hover:bg-[#f2f5f2]"
                        disabled={usersQuery.isPending || !usersQuery.data?.length}
                        onClick={() => {
                          setNotice("");
                          setTaskToAssign(task);
                        }}
                        type="button"
                        variant="ghost"
                      >
                        <UserPlus aria-hidden="true" />
                        {task.user ? "Cambiar" : "Asignar"}
                      </Button>
                      <Button
                        className="h-8 rounded-lg px-2.5 text-xs text-[#59685e] hover:bg-[#f2f5f2]"
                        disabled={isUpdating}
                        onClick={() => {
                          setNotice("");
                          statusMutation.mutate({
                            id: task.id,
                            status: isComplete ? "pending" : "complete",
                          });
                        }}
                        type="button"
                        variant="ghost"
                      >
                        {isUpdating ? (
                          <LoaderCircle aria-hidden="true" className="animate-spin" />
                        ) : isComplete ? (
                          <Circle aria-hidden="true" />
                        ) : (
                          <CircleCheck aria-hidden="true" />
                        )}
                        {isComplete ? "Reabrir" : "Completar"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="grid min-h-44 place-items-center px-4 py-8 text-center">
              <div>
                <span className="mx-auto mb-3 grid size-10 place-items-center rounded-xl bg-[#f1f4f1] text-[#718078]">
                  <Check aria-hidden="true" className="size-5" />
                </span>
                <p className="text-sm font-medium text-[#465149]">
                  No hay tareas para mostrar
                </p>
                <p className="mt-1 text-xs text-[#858e87]">
                  Crea una tarea o cambia el filtro de usuario.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateTaskDialog
        onCreated={() => setNotice("Tarea creada.")}
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />
      <AssignTaskDialog
        onAssigned={() => setNotice("Tarea asignada.")}
        onOpenChange={(open) => {
          if (!open) setTaskToAssign(null);
        }}
        task={taskToAssign}
        users={usersQuery.data ?? []}
      />
    </main>
  );
}

type CreateTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

function CreateTaskDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: async (body: CreateTaskDto) => {
      const result = await tasksControllerCreate({
        baseUrl: "/api",
        body,
      });
      if (result.error) {
        throw new Error(getApiError(result.error, "No se pudo crear la tarea."));
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
      setDescription("");
      onOpenChange(false);
      onCreated();
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function closeDialog() {
    if (createMutation.isPending) return;
    createMutation.reset();
    onOpenChange(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
    });
  }

  return (
    <dialog
      aria-labelledby="create-task-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[22px] border border-[#e7ebe7] bg-white p-0 text-[#202723] shadow-[0_28px_90px_-35px_rgba(17,28,21,0.35)] backdrop:bg-[#1c2721]/40 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
      ref={dialogRef}
    >
      <div className="flex items-start justify-between border-b border-[#eff1ee] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em]" id="create-task-title">
            Nueva tarea
          </h2>
          <p className="mt-1 text-sm text-[#7d877f]">
            Agrega el título y una descripción opcional.
          </p>
        </div>
        <button
          aria-label="Cerrar diálogo"
          className="grid size-8 place-items-center rounded-lg text-[#7d877f] hover:bg-[#f2f5f2]"
          disabled={createMutation.isPending}
          onClick={closeDialog}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <form className="space-y-4 px-5 py-5 sm:px-6" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#465149]" htmlFor="task-title">
            Título
          </label>
          <input
            autoFocus
            className="h-10 w-full rounded-xl border border-[#e2e7e2] px-3 text-sm outline-none placeholder:text-[#a2aaa4] focus:border-[#83958a] focus:ring-4 focus:ring-[#6e8a78]/10"
            id="task-title"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Preparar presentación"
            required
            value={title}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#465149]" htmlFor="task-description">
            Descripción <span className="font-normal text-[#909991]">(opcional)</span>
          </label>
          <textarea
            className="min-h-24 w-full resize-y rounded-xl border border-[#e2e7e2] px-3 py-2.5 text-sm outline-none placeholder:text-[#a2aaa4] focus:border-[#83958a] focus:ring-4 focus:ring-[#6e8a78]/10"
            id="task-description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Agrega un poco más de contexto"
            rows={3}
            value={description}
          />
        </div>

        {createMutation.isError && (
          <p
            aria-live="polite"
            className="rounded-xl border border-[#f0d8d5] bg-[#fff8f6] px-3.5 py-2.5 text-sm text-[#9d5046]"
            role="alert"
          >
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "No se pudo crear la tarea."}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-[#eff1ee] pt-4">
          <Button
            className="h-10 rounded-xl px-4 text-[#536057]"
            disabled={createMutation.isPending}
            onClick={closeDialog}
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
          <Button
            className="h-10 rounded-xl bg-[#25342d] px-4 text-white hover:bg-[#33463b]"
            disabled={createMutation.isPending || !title.trim()}
            type="submit"
          >
            {createMutation.isPending ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            Crear tarea
          </Button>
        </div>
      </form>
    </dialog>
  );
}

type AssignTaskDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
  users: TaskUser[];
};

function AssignTaskDialog({
  task,
  onOpenChange,
  onAssigned,
  users,
}: AssignTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const open = task !== null;

  const assignMutation = useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: number; userId: number }) => {
      const result = await tasksControllerAssignTaskToUser({
        baseUrl: "/api",
        path: { id: taskId },
        body: { userId },
      });
      if (result.error) {
        throw new Error(getApiError(result.error, "No se pudo asignar la tarea."));
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
      onAssigned();
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (task) {
      setUserId(task.user ? String(task.user.id) : "");
      assignMutation.reset();
    }
  }, [open, task?.id, task?.user?.id]);

  function closeDialog() {
    if (assignMutation.isPending) return;
    assignMutation.reset();
    onOpenChange(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task || !userId) return;
    assignMutation.mutate({ taskId: task.id, userId: Number(userId) });
  }

  return (
    <dialog
      aria-labelledby="assign-task-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[22px] border border-[#e7ebe7] bg-white p-0 text-[#202723] shadow-[0_28px_90px_-35px_rgba(17,28,21,0.35)] backdrop:bg-[#1c2721]/40 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
      ref={dialogRef}
    >
      <div className="flex items-start justify-between border-b border-[#eff1ee] px-5 py-4">
        <div className="min-w-0 pr-3">
          <h2 className="text-lg font-semibold tracking-[-0.03em]" id="assign-task-title">
            {task?.user ? "Cambiar asignación" : "Asignar tarea"}
          </h2>
          <p className="mt-1 truncate text-sm text-[#7d877f]">{task?.title}</p>
        </div>
        <button
          aria-label="Cerrar diálogo"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-[#7d877f] hover:bg-[#f2f5f2]"
          disabled={assignMutation.isPending}
          onClick={closeDialog}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#465149]" htmlFor="assign-user">
            Asignar a
          </label>
          <select
            className="h-10 w-full rounded-xl border border-[#e2e7e2] bg-white px-3 text-sm outline-none focus:border-[#83958a] focus:ring-4 focus:ring-[#6e8a78]/10"
            id="assign-user"
            onChange={(event) => setUserId(event.target.value)}
            required
            value={userId}
          >
            <option disabled value="">
              Selecciona un usuario
            </option>
            {users.map((taskUser) => (
              <option key={taskUser.id} value={taskUser.id}>
                {taskUser.name} (@{taskUser.username})
              </option>
            ))}
          </select>
        </div>

        {assignMutation.isError && (
          <p
            aria-live="polite"
            className="rounded-xl border border-[#f0d8d5] bg-[#fff8f6] px-3.5 py-2.5 text-sm text-[#9d5046]"
            role="alert"
          >
            {assignMutation.error instanceof Error
              ? assignMutation.error.message
              : "No se pudo asignar la tarea."}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-[#eff1ee] pt-4">
          <Button
            className="h-10 rounded-xl px-4 text-[#536057]"
            disabled={assignMutation.isPending}
            onClick={closeDialog}
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
          <Button
            className="h-10 rounded-xl bg-[#25342d] px-4 text-white hover:bg-[#33463b]"
            disabled={assignMutation.isPending || !userId}
            type="submit"
          >
            {assignMutation.isPending ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <UserPlus aria-hidden="true" />
            )}
            Asignar
          </Button>
        </div>
      </form>
    </dialog>
  );
}
