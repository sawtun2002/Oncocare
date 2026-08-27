import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createStaffUser, listUsers } from "../../api/users";
import { TableSkeleton } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import { btnPrimary, pageTitle, tableBase, tableHead, tableRow, tableWrap } from "../../lib/ui";
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
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });

  const createMutation = useMutation({
    mutationFn: (input) => createStaffUser(input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${user.name} can now sign in.`);
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
          <TableSkeleton columns={3} />
        ) : staff.length === 0 ? (
          <p className="p-4 text-sm text-ink-400">No staff accounts yet.</p>
        ) : (
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className={tableRow}>
                  <td className="px-4 py-2.5 font-medium text-ink-900">{u.name}</td>
                  <td className="px-4 py-2.5 text-ink-400">{u.email}</td>
                  <td className="px-4 py-2.5 text-ink-700">{ROLE_LABEL[u.role]}</td>
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
    </div>
  );
}
