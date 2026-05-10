import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      _count: { select: { referrals: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Referrals</th>
              <th className="px-4 py-3">Ref code</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-white">{u.username}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{formatPkr(u.balance)}</td>
                <td className="px-4 py-3">{u._count.referrals}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{u.referenceCode}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs font-semibold text-sky-400 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
