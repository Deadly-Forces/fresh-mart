"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  label?: string;
  fileName: string;
  headers: string[];
  rows: string[][];
}

export function ExportButton({
  label = "Export",
  fileName,
  headers,
  rows,
}: ExportButtonProps) {
  const handleExport = () => {
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csvHeader = headers.map(escape).join(",");
    const csvBody = rows.map((row) => row.map(escape).join(",")).join("\n");
    const csv = csvHeader + "\n" + csvBody;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1"
      onClick={handleExport}
    >
      <Download className="w-4 h-4" /> {label}
    </Button>
  );
}
