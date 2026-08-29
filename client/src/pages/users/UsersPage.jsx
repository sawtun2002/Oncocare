import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createStaffUser, listUsers, updateUserStatus } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { btnPrimary, dangerAction, pageTitle, tableBase, tableHead, tableRow, tableWrap } from "../../lib/ui";
import { StaffUserDetailDialog } from "./StaffUserDetailDialog";
import { StaffUserFormDialog } from "./StaffUserFormDialog";

function isStaff(user) {
  return user.role !== "PATIENT";
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });

  const createMutation = useMutation({
    mutationFn: (input) => createStaffUser(input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-profiles"] });
      toast.success(t("users.canSignIn", { name: user.name }));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateUserStatus(id, status),
    onSuccess: (updated, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        status === "INACTIVE"
          ? t("users.deactivated", { name: updated.name })
          : t("users.reactivated", { name: updated.name })
      );
    },
  });

  // This screen manages staff logins only. Patient accounts are created via
  // the public signup form and are not listed or editable here.
  const staff = (usersQuery.data ?? []).filter(isStaff);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>{t("users.title")}</h1>
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          {t("users.add")}
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-400">{t("users.subtitle")}</p>

      <div className={`mt-6 ${tableWrap}`}>
        {usersQuery.isLoading ? (
          <TableSkeleton columns={5} />
        ) : staff.length === 0 ? (
          <p className="p-4 text-sm text-ink-400">{t("users.none")}</p>
        ) : (
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">{t("users.colName")}</th>
                <th className="px-4 py-2.5">{t("users.colEmail")}</th>
                <th className="px-4 py-2.5">{t("users.colRole")}</th>
                <th className="px-4 py-2.5">{t("users.colStatus")}</th>
                <th className="px-4 py-2.5">{t("users.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className={tableRow}>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setViewing(u)}
                      className="font-medium text-ink-900 transition hover:text-frost-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-frost-400/50"
                    >
                      {u.name}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-ink-400">{u.email}</td>
                  <td className="px-4 py-2.5 text-ink-700">{t(`role.${u.role}`)}</td>
                  <td className="px-4 py-2.5">
                    <Badge status={u.status ?? "ACTIVE"} />
                  </td>
                  <td className="px-4 py-2.5">
                    {u.id === currentUser?.id ? (
                      // Deactivating (or "reactivating", which makes no sense
                      // here since you're clearly signed in) your own account is
                      // blocked -- doing it by accident would lock everyone out
                      // with no other admin able to undo it.
                      <span className="text-xs text-ink-400">{t("users.you")}</span>
                    ) : u.status === "INACTIVE" ? (
                      <button
                        type="button"
                        onClick={() =>
                          statusMutation.mutate(
                            { id: u.id, status: "ACTIVE" },
                            { onError: () => toast.error(t("users.couldNotReactivate")) }
                          )
                        }
                        className="rounded-lg px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface/70"
                      >
                        {t("users.reactivate")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeactivating(u)}
                        className={`rounded-lg px-2 py-1 text-xs font-medium ${dangerAction}`}
                      >
                        {t("users.deactivate")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewing && <StaffUserDetailDialog user={viewing} onClose={() => setViewing(null)} />}

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
          title={t("users.deactivateTitle")}
          message={t("users.deactivateMsg", { name: deactivating.name })}
          confirmLabel={t("users.deactivateConfirm")}
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
