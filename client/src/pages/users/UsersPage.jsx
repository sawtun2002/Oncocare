import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createStaffUser, listUsers, updateUserStatus } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { btnPrimary, dangerAction, pageTitle, tableBase, tableHead, tableRow, tableWrap } from "../../lib/ui";
import { StaffUserFormDialog } from "./StaffUserFormDialog";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
};

function isStaff(user) {
  return user.role !== "PATIENT";
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deactivating, setDeactivating] = useState(null);

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });

  const createMutation = useMutation({
    mutationFn: (input) => createStaffUser(input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${user.name} can now sign in.`);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateUserStatus(id, status),
    onSuccess: (updated, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        status === "INACTIVE"
          ? `${updated.name}'s account has been deactivated.`
          : `${updated.name}'s account has been reactivated.`
      );
    },
  });

  // This screen manages staff logins only. Patient accounts are created via
  // the public signup form and are not listed or editable here.
  const staff = (usersQuery.data ?? []).filter(isStaff);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>Staff accounts</h1>
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          + Add staff account
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-400">
        Administrator, Doctor, Nurse and Receptionist logins. Patients create their own accounts from the
        login page.
      </p>

      <div className={`mt-6 ${tableWrap}`}>
        {usersQuery.isLoading ? (
          <TableSkeleton columns={5} />
        ) : staff.length === 0 ? (
          <p className="p-4 text-sm text-ink-400">No staff accounts yet.</p>
        ) : (
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className={tableRow}>
                  <td className="px-4 py-2.5 font-medium text-ink-900">{u.name}</td>
                  <td className="px-4 py-2.5 text-ink-400">{u.email}</td>
                  <td className="px-4 py-2.5 text-ink-700">{ROLE_LABEL[u.role]}</td>
                  <td className="px-4 py-2.5">
                    <Badge status={u.status ?? "ACTIVE"} />
                  </td>
                  <td className="px-4 py-2.5">
                    {u.id === currentUser?.id ? (
                      // Deactivating (or "reactivating", which makes no sense
                      // here since you're clearly signed in) your own account is
                      // blocked -- doing it by accident would lock everyone out
                      // with no other admin able to undo it.
                      <span className="text-xs text-ink-400">You</span>
                    ) : u.status === "INACTIVE" ? (
                      <button
                        type="button"
                        onClick={() =>
                          statusMutation.mutate(
                            { id: u.id, status: "ACTIVE" },
                            { onError: () => toast.error("Could not reactivate that account.") }
                          )
                        }
                        className="rounded-lg px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface/70"
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeactivating(u)}
                        className={`rounded-lg px-2 py-1 text-xs font-medium ${dangerAction}`}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <StaffUserFormDialog
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
          }}
        />
      )}

      {deactivating && (
        <ConfirmDialog
          title="Deactivate this account?"
          message={`${deactivating.name} will no longer be able to sign in. Their record, and anything already tied to it -- assigned patients, past and future appointments -- stays exactly as it is, and you can reactivate them at any time.`}
          confirmLabel="Deactivate"
          danger
          onClose={() => setDeactivating(null)}
          onConfirm={async () => {
            await statusMutation.mutateAsync({ id: deactivating.id, status: "INACTIVE" });
          }}
        />
      )}
    </div>
  );
}
