"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserRoleAction } from "@/features/admin/actions/productActions";

interface UserRow {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    spent: number;
    joined: string;
    role: string;
}

export function UsersClient({ users }: { users: UserRow[] }) {
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [roleMsg, setRoleMsg] = useState("");
    const router = useRouter();

    const filtered = users.filter((u) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.phone.includes(q)
        );
    });

    const handleExport = () => {
        const csvHeader = "Name,Email,Phone,Orders,Total Spent,Joined,Role\n";
        const csvRows = filtered
            .map(
                (u) =>
                    `"${u.name}","${u.email}","${u.phone}",${u.orders},${u.spent.toFixed(2)},${u.joined},${u.role}`,
            )
            .join("\n");
        const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users-export.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        setUpdatingId(userId);
        setRoleMsg("");
        startTransition(async () => {
            const result = await updateUserRoleAction(userId, newRole as "customer" | "admin" | "delivery");
            setUpdatingId(null);
            if (result.error) {
                setRoleMsg(result.error);
                setTimeout(() => setRoleMsg(""), 3000);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by email or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={handleExport}
                >
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            {roleMsg && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {roleMsg}
                </div>
            )}

            <div className="bg-card border border-border rounded-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    Phone
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    Orders
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    Total Spent
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    Joined
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        {search
                                            ? "No users match your search."
                                            : "No users found."}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-secondary/30 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{u.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {u.phone}
                                        </td>
                                        <td className="px-4 py-3">{u.orders}</td>
                                        <td className="px-4 py-3 font-semibold">
                                            ₹{u.spent.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {u.joined}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                disabled={isPending && updatingId === u.id}
                                                title={`Role for ${u.name}`}
                                                className={`px-2 py-1 text-xs rounded-md border border-border bg-background capitalize cursor-pointer ${isPending && updatingId === u.id ? "opacity-50" : ""
                                                    }`}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="admin">Admin</option>
                                                <option value="delivery">Delivery</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
                    Showing {filtered.length} of {users.length} user
                    {users.length !== 1 ? "s" : ""}
                </div>
            </div>
        </>
    );
}
